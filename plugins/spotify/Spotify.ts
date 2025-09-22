import { ResolveOptions } from '../../types/Ruvyrias';
import { SpotifyManager } from './SpotifyManager';
import { Ruvyrias } from '../../src/Ruvyrias';
import { Plugin } from '../../src/Plugin';
import { Track } from '../../src/Track';
import cheerio from 'cheerio';
import {
    SpotifyOptions,
    SpotifyAccessTokenAPIResult,
    SpotifyPlaylist, spotifyAlbum,
    SpotifyArtist,
    SpotifyTrack,
    loadTypeSPTF
} from '../../types/Spotify';

const spotifyPattern = /^(?:https:\/\/open\.spotify\.com\/(?:intl-\w+\/)?(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/;
const SHORT_LINK_PATTERN = 'https://spotify.link';

/**
 * Represents the Spotify plugin class, extending the base Plugin class.
 */
export class Spotify extends Plugin {
    public ruvyrias: Ruvyrias;
    public options: SpotifyOptions;
    private originalResolve!: ({ query, source, requester }: ResolveOptions) => any;
    public spotifyManager: SpotifyManager;

    public constructor(options: Omit<SpotifyOptions, 'authorization' | 'interval' | 'token'>) {
        super('Spotify');
        this.spotifyManager = new SpotifyManager(options as SpotifyOptions);
        this.options = {
            playlistLimit: options.playlistLimit,
            albumLimit: options.albumLimit,
            searchMarket: options.searchMarket,
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            authorization: Buffer.from(`${options.clientId}:${options.clientSecret}`).toString('base64'),
            token: '',
            interval: 0
        };
    }

    /**
     * Loads the Spotify plugin into the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance.
     */
    public async load(ruvyrias: Ruvyrias) {
        this.ruvyrias = ruvyrias;
        this.originalResolve = ruvyrias.search.bind(ruvyrias);
        ruvyrias.search = this.resolve.bind(this);
    }

    /**
     * Checks if the provided URL is a Spotify URL.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL is a Spotify URL, false otherwise.
     */
    private check(url: string): boolean {
        return spotifyPattern.test(url);
    }

    /**
     * Requests an access token from the Spotify API using client credentials.
     * @returns {Promise<void>} - A promise that resolves when the token is successfully requested and set.
     */
    private async requestToken(): Promise<void> {
        try {
            const data = await fetch(
                'https://accounts.spotify.com/api/token?grant_type=client_credentials',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${this.options.authorization}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const body = (await data.json()) as SpotifyAccessTokenAPIResult;

            this.options.token = `Bearer ${body.access_token}`;
            this.options.interval = body.expires_in * 1000;
        } catch (e: any) {
            if (e.status === 400) {
                throw new Error('Spotify Plugin has been rate limited');
            }
        }
    }

    /**
     * Resolves a Spotify query, handling various types such as playlists, tracks, albums, and artists.
     * If a token is not available, it requests one using client credentials.
     * @param {ResolveOptions} options - The resolve options including query, source, and requester.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private async resolve({ query, source, requester }: ResolveOptions): Promise<any> {
        if (!this.options.token) await this.requestToken();
        if (query.startsWith(SHORT_LINK_PATTERN))
            return this.decodeSpotifyShortLink({ query, source, requester });
        if (source === 'spsearch' && !this.check(query))
            return this.fetch(query, source, requester);

        const data = spotifyPattern.exec(query) ?? [];
        const id: string = data[2];
        switch (data[1]) {
            case 'playlist': {
                return this.fetchPlaylist(id, requester);
            }
            case 'track': {
                return this.fetchTrack(id, requester);
            }
            case 'album': {
                return this.fetchAlbum(id, requester);
            }
            case 'artist': {
                return this.fetchArtist(id, requester);
            }
            default: {
                return this.originalResolve({
                    query,
                    source: source ?? this.ruvyrias.options.defaultPlatform,
                    requester: requester,
                });
            }
        }
    }

    /**
     * Decodes a Spotify short link and resolves the resulting Spotify URL.
     * @param {ResolveOptions} options - The resolve options including query, source, and requester.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private async decodeSpotifyShortLink({ query, source, requester }: ResolveOptions): Promise<any> {
        const res = await fetch(query, { method: 'GET' });
        const text = await res.text();
        const $ = cheerio.load(text);
        const spotifyLink = $('a.secondary-action');
        const spotifyUrl = spotifyLink.attr('href');

        return this.resolve({ query: spotifyUrl as string, source, requester });
    }

    /**
     * Fetches a playlist from Spotify and resolves its tracks.
     * @param {string} id - The ID of the playlist.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private async fetchPlaylist(id: string, requester: any): Promise<any> {
        try {
            const playlist = (await this.spotifyManager.send(
                `/playlists/${id}`
            )) as SpotifyPlaylist;
            await this.fetchPlaylistTracks(playlist);

            const limitedTracks = this.options.playlistLimit
                ? playlist.tracks?.items.slice(0, this.options.playlistLimit)
                : playlist.tracks?.items;

            const unresolvedPlaylistTracks = await Promise.all((limitedTracks as object[]).map((x: any) => this.buildUnresolved(x.track, requester)));

            return this.buildResponse(
                'playlist',
                unresolvedPlaylistTracks,
                playlist.name
            );
        } catch (e: any) {
            return this.buildResponse(
                e.status === 404 ? 'empty' : 'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Fetches an album from Spotify and resolves its tracks.
     * @param {string} id - The ID of the album.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private async fetchAlbum(id: string, requester: any): Promise<any> {
        try {
            const album = (await this.spotifyManager.send(
                `/albums/${id}`
            )) as spotifyAlbum;

            const limitedTracks = this.options.albumLimit
                ? album.tracks.items.slice(0, this.options.albumLimit * 100)
                : album.tracks.items;

            const unresolvedPlaylistTracks = await Promise.all(
                limitedTracks.map((x: any) => this.buildUnresolved(x, requester))
            );
            return this.buildResponse(
                'playlist',
                unresolvedPlaylistTracks,
                album.name
            );
        } catch (e: any) {
            return this.buildResponse(
                e.body?.error.message === 'invalid id' ? 'empty' : 'empty',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Fetches an artist from Spotify and resolves their top tracks.
     * @param {string} id - The ID of the artist.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private async fetchArtist(id: string, requester: any): Promise<any> {
        try {
            const artist = (await this.spotifyManager.send(
                `/artists/${id}`
            )) as SpotifyArtist;

            const data = (await this.spotifyManager.send(
                `/artists/${id}/top-tracks?market=${this.options.searchMarket ?? 'US'}`
            )) as { tracks: SpotifyTrack[] };

            const unresolvedPlaylistTracks = await Promise.all(
                data.tracks.map((x: any) => this.buildUnresolved(x, requester))
            );

            return this.buildResponse(
                'playlist',
                unresolvedPlaylistTracks,
                artist.name
            );
        } catch (e: any) {
            return this.buildResponse(
                e.body?.error.message === 'invalid id' ? 'empty' : 'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Fetches a track from Spotify and resolves it.
     * @param {string} id - The ID of the track.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private async fetchTrack(id: string, requester: any): Promise<any> {
        try {
            const data = (await this.spotifyManager.send(`/tracks/${id}`)) as SpotifyTrack;
            const unresolvedTrack = await this.buildUnresolved(data, requester);

            return this.buildResponse('track', [unresolvedTrack]);
        } catch (e: any) {
            return this.buildResponse(
                e.body?.error.message === 'invalid id' ? 'empty' : 'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Fetches data from Spotify based on the provided query, source, and requester information.
     * @param {string} query - The search query.
     * @param {string} source - The source of the request.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private async fetch(query: string, source: string, requester: any): Promise<any> {
        try {
            if (this.check(query))
                return this.resolve({
                    query,
                    source: source ?? this.ruvyrias.options.defaultPlatform,
                    requester,
                });

            const data = await this.spotifyManager.send(`/search/?q='${query}'&type=artist,album,track&market=${this.options.searchMarket ?? 'US'}`);
            const unresolvedTracks = await Promise.all((data as any).tracks.items.map((x: any) => this.buildUnresolved(x, requester)));

            return this.buildResponse('track', unresolvedTracks);
        } catch (e: any) {
            return this.buildResponse(
                e.body?.error.message === 'invalid id' ? 'empty' : 'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Fetches additional tracks for a Spotify playlist.
     * @param {SpotifyPlaylist} spotifyPlaylist - The Spotify playlist object.
     * @returns {Promise<void>} - A Promise that resolves when the tracks are fetched.
     */
    private async fetchPlaylistTracks(spotifyPlaylist: SpotifyPlaylist): Promise<void> {
        let nextPage = spotifyPlaylist.tracks?.next;
        let pageLoaded = 1;
        while (nextPage) {
            if (!nextPage) break;
            const body: any = await this.spotifyManager.getData(nextPage);
            if (body.error) break;
            spotifyPlaylist.tracks?.items.push(...body.items);

            nextPage = body.next;
            pageLoaded++;
        }
    }

    /**
     * Builds an unresolved Track object based on the provided Spotify track and requester information.
     * @param {SpotifyTrack} track - The Spotify track object.
     * @param {any} requester - The requester information.
     * @returns {Promise<Track>} - The unresolved Track object.
     */
    private async buildUnresolved(track: SpotifyTrack, requester: any): Promise<Track> {
        if (!track) {
            throw new ReferenceError('The Spotify track object was not provided');
        }

        return new Track({
            encoded: '',
            info: {
                sourceName: 'spotify',
                identifier: track.id,
                title: track.name,
                author: track.artists[0]?.name ?? 'Unknown Artist',
                album: track.album.name ?? 'Unkown Album',
                uri: `https://open.spotify.com/track/${track.id}`,
                artworkUrl: track.album?.images[0]?.url,
                isrc: track.external_ids.isrc,
                length: track.duration_ms,
                isSeekable: true,
                isStream: false,
            },
            pluginInfo: null,
            userData: {}
        }, requester);
    }

    /**
     * Builds a response object based on the provided loadType, tracks, playlistName, and exception message.
     * @param {loadTypeSPTF} loadType - The type of data being loaded.
     * @param {any} tracks - The tracks data.
     * @param {string} playlistName - The name of the playlist (optional).
     * @param {string} exceptionMsg - The exception message (optional).
     * @returns {any} - The built response object.
     */
    private buildResponse(
        loadType: loadTypeSPTF,
        tracks: any,
        playlistName?: string,
        exceptionMsg?: string
    ): any {
        return Object.assign(
            {
                loadType,
                tracks,
                playlistInfo: playlistName ? { name: playlistName } : {},
            },
            exceptionMsg
                ? { exception: { message: exceptionMsg, severity: 'COMMON' } }
                : {}
        );
    }
}