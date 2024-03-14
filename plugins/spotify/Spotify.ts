import { Ruvyrias, ResolveOptions } from '../../src/Ruvyrias';
import { Track } from '../../src/Guild/Track';
import { Plugin } from '../../src/Plugin';
import { SpotifyManager } from './SpotifyManager';
import cheerio from 'cheerio';

const spotifyPattern = /^(?:https:\/\/open\.spotify\.com\/(?:intl-\w+\/)?(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/;
const SHORT_LINK_PATTERN = 'https://spotify.link';

/**
 * Options for interacting with the Spotify API.
 */
export interface SpotifyOptions {
    /** The client ID for accessing the Spotify API. */
    clientID: string;
    /** The client secret for accessing the Spotify API. */
    clientSecret: string;
    /** Additional clients with their respective client ID and client secret for rotation. */
    clients?: { clientID: string; clientSecret: string }[];
    /** Maximum limit for the number of playlists to fetch. */
    playlistLimit?: number;
    /** Maximum limit for the number of albums to fetch. */
    albumLimit?: number;
    /** Maximum limit for the number of search results to fetch. */
    searchLimit?: number;
    /** The market to use for search queries. */
    searchMarket?: string;
    /** Authorization string for accessing the Spotify API. */
    authorization?: string;
    /** Interval for token refresh in milliseconds. */
    interval?: number;
    /** Current access token for interacting with the Spotify API. */
    token?: string;
}

/**
 * Result from the Spotify Access Token API, containing access token and expiration details.
 */
export interface SpotifyAccessTokenAPIResult {
    access_token?: string;
    expires_in: number;
}

/**
 * Types for the different load scenarios in the Spotify plugin.
 */
export type loadType =
    | 'track'
    | 'playlist'
    | 'search'
    | 'empty'
    | 'error';

/**
 * Represents the number of followers for a Spotify entity.
 */
export interface SpotifyFollower {
    href: string;
    total: number;
}

/**
 * Represents an image in the Spotify API.
 */
export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

/**
 * Represents a Spotify user's information.
 */
export interface SpotifyUser {
    display_name: string | null;
    external_urls: {
        spotify: string;
    };
    followers: SpotifyFollower;
    href: string;
    id: string;
    images: SpotifyImage[];
    type: 'user';
    uri: string;
}

/**
 * Represents the result of a Spotify track search.
 */
export interface SpotifySearchTrack {
    href: string;
    items: object[];
    limit: number;
    next: string;
    offset: string;
    previous: string;
    total: number;
}

/**
 * Represents a Spotify track.
 */
export interface SpotifyTrack {
    album: spotifyAlbum & {
        album_group?: string;
        artists: Omit<
            SpotifyArtist,
            'followers' | 'images' | 'genres' | 'popularity'
        >;
    };
    artists: SpotifyArtist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: {
        isrc: string;
        ean: string;
        upc: string;
    };
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    is_playable: boolean;

    /**
     * @description not adding types cause it's a big object
     */
    linked_from: object;
    restrictions: {
        reason: string;
    };
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: 'track';
    uri: string;
    is_local: boolean;
}

/**
 * Represents a Spotify artist.
 */
export interface SpotifyArtist
    extends Omit<SpotifyUser, 'display_name' | 'type'> {
    name: string;
    genres: string[];
    popularity: number;
    type: 'artist';
    uri: string;
}

/**
 * Represents a Spotify playlist.
 */
export interface SpotifyPlaylist {
    collaborative: boolean;
    description: string | null;
    external_urls: {
        spotify: string;
    };
    followers: SpotifyFollower;
    href: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    owner: {
        external_urls: {
            spotify: string;
        };
        followers: SpotifyFollower;
        href: string;
        id: string;
        type: 'user';
        uri: string;
        display_name: string;
    };
    public: boolean;
    snapshot_id: string;
    tracks?: SpotifySearchTrack;
    type: 'playlist';
    uri: string;
}

/**
 * Represents a Spotify album.
 */
export interface spotifyAlbum {
    album_type: string;
    total_tracks: number;
    available_markets: string[];
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    release_date: string;
    release_date_precision: string;
    restrictions?: {
        reason: string;
    };
    type: 'album';
    uri: string;
    artists: SpotifyArtist[];
    tracks: SpotifySearchTrack;
}

/**
 * Represents a regular Spotify error.
 */
export interface SpotifyRegularError {
    status: number;
    message: string;
}

export class Spotify extends Plugin {
    private baseURL: string = 'https://api.spotify.com/v1';
    public ruvyrias: Ruvyrias;
    public options: SpotifyOptions;
    private _resolve!: ({ query, source, requester }: ResolveOptions) => any;
    public spotifyManager: SpotifyManager;

    public constructor(options: Omit<SpotifyOptions, 'authorization' | 'interval' | 'token'>) {
        super('Spotify');
        this.spotifyManager = new SpotifyManager(options as SpotifyOptions);
        this.options = {
            playlistLimit: options.playlistLimit,
            albumLimit: options.albumLimit,
            searchMarket: options.searchMarket,
            clientID: options.clientID,
            clientSecret: options.clientSecret,
            authorization: Buffer.from(`${options.clientID}:${options.clientSecret}`).toString('base64'),
            token: '',
            interval: 0
        };
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
     * Loads the Spotify plugin into the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance.
     */
    public async load(ruvyrias: Ruvyrias) {
        this.ruvyrias = ruvyrias;
        this._resolve = ruvyrias.resolve.bind(ruvyrias);
        ruvyrias.resolve = this.resolve.bind(this);
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
                return this._resolve({
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
        let res = await fetch(query, { method: 'GET' });
        const text = await res.text();
        const $ = cheerio.load(text);
        const spotifyLink = $('a.secondary-action');
        const spotifyUrl = spotifyLink.attr('href');

        return this.resolve({ query: spotifyUrl, source, requester });
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
                ? playlist.tracks.items.slice(0, this.options.playlistLimit)
                : playlist.tracks.items;

            const unresolvedPlaylistTracks = await Promise.all(
                limitedTracks.map((x: any) => this.buildUnresolved(x.track, requester))
            );

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
        let nextPage = spotifyPlaylist.tracks.next;
        let pageLoaded = 1;
        while (nextPage) {
            if (!nextPage) break;
            const body: any = await this.spotifyManager.getData(nextPage);
            if (body.error) break;
            spotifyPlaylist.tracks.items.push(...body.items);

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
     * @param {loadType} loadType - The type of data being loaded.
     * @param {any} tracks - The tracks data.
     * @param {string} playlistName - The name of the playlist (optional).
     * @param {string} exceptionMsg - The exception message (optional).
     * @returns {any} - The built response object.
     */
    private buildResponse(
        loadType: loadType,
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