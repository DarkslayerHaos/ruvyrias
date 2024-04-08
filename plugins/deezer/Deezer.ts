import { Ruvyrias, ResolveOptions } from '../../src/Ruvyrias';
import { Track } from '../../src/Guild/Track';
import { Plugin } from '../../src/Plugin';

const DEEZER_SHARE_LINK = 'https://deezer.page.link/'
const DEEZER_PUBLIC_API = 'https://api.deezer.com/2.0';
const DEEZER_REGEX = /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/;

/**
 * Represents the different types of load operations.
 */
export type loadType =
    | 'track'
    | 'playlist'
    | 'search'
    | 'empty'
    | 'error';

/**
 * Represents a contributor to a track on Deezer, providing information such as their ID, name, and role.
 */
export interface DeezerContributor {
    id: number;
    name: string;
    link: string;
    share: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
    radio: boolean;
    tracklist: string;
    type: string;
    role: string;
}

/**
 * Represents an artist on Deezer, containing details such as their ID, name, and link.
 */
export interface DeezerArtist {
    data: any;
    id: number;
    name: string;
    link: string;
    share: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
    radio: boolean;
    tracklist: string;
    type: string;
}

/**
 * Represents an album on Deezer, containing information such as its ID, title, and release date.
 */
export interface DeezerAlbum {
    tracks: DeezerTrack;
    id: number;
    title: string;
    link: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
    md5_image: string;
    release_date: string;
    tracklist: string;
    type: string;
}

/**
 * Represents a track on Deezer, providing details like its ID, title, duration, and associated artist and album.
 */
export interface DeezerTrack {
    data: any
    id: string;
    readable: boolean;
    title: string;
    title_short: string;
    title_version: string;
    isrc: string;
    link: string;
    share: string;
    duration: number;
    track_position: number;
    disk_number: number;
    rank: number;
    release_date: string;
    explicit_lyrics: boolean;
    explicit_content_lyrics: number;
    explicit_content_cover: number;
    preview: string;
    bpm: number;
    gain: number;
    available_countries: string[];
    contributors: DeezerContributor[];
    md5_image: string;
    artist: DeezerArtist;
    album: DeezerAlbum;
    type: string;
}

/**
 * Represents the Deezer class, extending the base Plugin class.
 */
export class Deezer extends Plugin {
    private baseURL: string = DEEZER_PUBLIC_API;
    private ruvyrias: Ruvyrias;
    private _resolve!: ({ query, source, requester }: ResolveOptions) => any;
    public constructor() {
        super('Deezer');
    }

    /**
     * Overrides the load method of the Plugin class, enabling the Deezer plugin to interact with the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance.
     */
    public async load(ruvyrias: Ruvyrias) {
        this.ruvyrias = ruvyrias;
        this._resolve = ruvyrias.resolve.bind(ruvyrias);
        ruvyrias.resolve = this.resolve.bind(this);
    }

    /**
     * Checks if the provided URL matches the Deezer regex pattern.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL matches the Deezer regex pattern, false otherwise.
     */
    private check(url: string): boolean {
        return DEEZER_REGEX.test(url);
    }

    /**
     * Checks if the provided URL is a Deezer share link.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL is a Deezer share link, false otherwise.
     */
    private isDeezerShareLink(url?: string): boolean {
        if (url) {
            return url.startsWith(DEEZER_SHARE_LINK);
        } else {
            return false;
        }
    }

    /**
     * Resolves a track, album, playlist, or artist from Deezer based on the provided query, source, and requester.
     * @param {ResolveOptions} options - The options for resolving a track.
     * @returns {Promise<unknown>} - A promise that resolves to the result of the Deezer resolution.
     */
    private async resolve({ query, source, requester }: ResolveOptions): Promise<unknown> {

        if (this.isDeezerShareLink(query)) {
            const newURL = await this.decodeDeezerShareLink(query) as string;
            if (newURL.startsWith('https://www.deezer.com/')) {
                return this.resolve({ query: newURL, source: source ?? this.ruvyrias.options.defaultPlatform, requester });
            }
        }

        if (source?.toLowerCase() === 'dzsearch' && !this.check(query))
            return this.getQuerySong(query, requester);

        const [, type, id] = DEEZER_REGEX.exec(query) ?? [];


        switch (type) {
            case 'track': {
                return this.getTrack(id, requester)
            }
            case 'album': {
                return this.getAlbum(id, requester)
            }
            case 'playlist': {
                return this.getPlaylist(id, requester)
            }
            case 'artist': {
                return this.getArtist(id, requester)
            }
            default: {
                return this._resolve({ query, source: source ?? this.ruvyrias?.options.defaultPlatform, requester: requester })
            }
        }
    }

    /**
     * Retrieves information about a Deezer track based on the provided ID and requester.
     * @param {string} id - The ID of the Deezer track.
     * @param {any} requester - The requester of the track information.
     * @returns {Promise<DeezerTrack | object>} - A promise that resolves to the Deezer track information.
     */
    private async getTrack(id: string, requester: any): Promise<DeezerTrack | object> {
        try {
            const track = await this.getData(`/track/${id}`) as DeezerTrack;
            const unresolvedTracks = await this.buildUnresolved(track, requester)

            return this.buildResponse('track', [unresolvedTracks]);

        } catch (e: any) {
            return this.buildResponse(
                'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Retrieves information about a Deezer playlist based on the provided ID and requester.
     * @param {string} id - The ID of the Deezer playlist.
     * @param {any} requester - The requester of the playlist information.
     * @returns {Promise<object>} - A promise that resolves to the Deezer playlist information.
     */
    private async getPlaylist(id: string, requester: any): Promise<object> {
        try {
            const playlist: any = await this.getData(`/playlist/${id}`);
            const unresolvedPlaylistTracks = await Promise.all(playlist.tracks.data.map((x: DeezerTrack) => this.buildUnresolved(x, requester)));

            return this.buildResponse('playlist', unresolvedPlaylistTracks, playlist.title);

        } catch (e: any) {
            return this.buildResponse(
                'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Retrieves information about a Deezer artist based on the provided ID and requester.
     * @param {string} id - The ID of the Deezer artist.
     * @param {any} requester - The requester of the artist information.
     * @returns {Promise<DeezerArtist | object>} - A promise that resolves to the Deezer artist information.
     */
    private async getArtist(id: string, requester: any): Promise<DeezerArtist | object> {
        try {

            const artistData = await this.getData(`/artist/${id}`) as DeezerArtist;
            const artist = await this.getData(`/artist/${id}/top`) as DeezerArtist;
            await this.getArtistTracks(artist)

            if (artist.data.length === 0) return this.buildResponse('error', [], undefined, 'This artist does not have any top songs');

            const unresolvedArtistTracks = await Promise.all(artist.data.map((x: DeezerTrack) => this.buildUnresolved(x, requester)));

            return this.buildResponse('playlist', unresolvedArtistTracks, `${artistData.name}'s top songs`);

        } catch (e: any) {
            return this.buildResponse(
                'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Retrieves additional tracks for a Deezer artist to ensure a comprehensive list.
     * @param {any} deezerArtist - The Deezer artist object containing track information.
     * @returns {Promise<void>} - A promise that resolves once additional tracks are loaded.
     */
    private async getArtistTracks(deezerArtist: any): Promise<void> {
        let nextPage = deezerArtist.next;
        let pageLoaded = 1;
        while (nextPage) {
            if (!nextPage) break;
            const req = await fetch(nextPage);
            const json: any = await req.json();

            deezerArtist.data.push(...json.data);

            nextPage = json.next;
            pageLoaded++;
        }
    }

    /**
     * Retrieves Deezer tracks based on a search query and requester.
     * @param {any} query - The search query.
     * @param {any} requester - The requester for the tracks.
     * @returns {Promise<unknown>} - A promise that resolves to Deezer tracks based on the search query.
     */
    private async getQuerySong(query: any, requester: any): Promise<unknown> {
        if (this.check(query)) return this.resolve(query);

        try {
            const tracks = await this.getData(`/search?q=${encodeURIComponent(query)}`) as DeezerTrack;
            const unresolvedTracks = await Promise.all(tracks.data.map((x: DeezerTrack) => this.buildUnresolved(x, requester)));
            return this.buildResponse('search', unresolvedTracks);
        } catch (e: any) {
            return this.buildResponse(
                'empty',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Retrieves Deezer album tracks based on the album ID and requester.
     * @param {string} id - The ID of the Deezer album.
     * @param {any} requester - The requester for the album tracks.
     * @returns {Promise<DeezerAlbum | object>} - A promise that resolves to Deezer album tracks based on the album ID.
     */
    private async getAlbum(id: string, requester: any): Promise<DeezerAlbum | object> {
        try {
            const album = await this.getData(`/album/${id}`) as DeezerAlbum;
            const unresolvedAlbumTracks = await Promise.all(album.tracks.data.map((x: DeezerTrack) => this.buildUnresolved(x, requester)));

            return this.buildResponse('playlist', unresolvedAlbumTracks, album.title);

        } catch (e: any) {
            return this.buildResponse(
                'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Decodes a Deezer share link to obtain the original URL.
     * @param {string} url - The Deezer share link to decode.
     * @returns {Promise<string | undefined>} - A promise that resolves to the original URL after decoding the Deezer share link.
     */
    private async decodeDeezerShareLink(url: string): Promise<string | undefined> {
        const req = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
        });

        if (req.status === 302) {
            const location = req.headers.get('location');
            return location;
        }

        return undefined
    }

    /**
     * Fetches data from the Deezer API based on the specified endpoint.
     * @param {string} endpoint - The Deezer API endpoint to retrieve data from.
     * @returns {Promise<unknown>} - A promise that resolves to the data fetched from the Deezer API.
     */
    private async getData(endpoint: string): Promise<unknown> {
        const req = await fetch(`${this.baseURL}/${endpoint}`, {});
        const data = await req.json();
        return data;
    }

    /**
     * Builds an unresolved track using the provided Deezer track object and requester.
     * @param {DeezerTrack} track - The Deezer track object.
     * @param {any} requester - The requester for the track.
     * @returns {Promise<Track>} - An unresolved Track instance representing the Deezer track.
     */
    private async buildUnresolved(track: DeezerTrack, requester: any): Promise<Track> {
        if (!track) {
            throw new ReferenceError('The Deezer track object was not provided');
        }

        return new Track({
            encoded: '',
            info: {
                sourceName: 'deezer',
                identifier: track.id,
                title: track.title,
                author: track.artist ? track.artist.name : 'Unknown Artist',
                album: track.album.title ?? 'Unkown Album',
                uri: track.link,
                artworkUrl: track.album.cover_medium,
                isrc: track.isrc,
                length: track.duration * 1000,
                isSeekable: true,
                isStream: false,
            },
            pluginInfo: null,
            userData: {},
        }, requester);
    }

    /**
     * Builds a response object based on the specified parameters.
     * @param {loadType} loadType - The load type of the response.
     * @param {any} tracks - The tracks associated with the response.
     * @param {string | undefined} playlistName - The name of the playlist (optional).
     * @param {string | undefined} exceptionMsg - The exception message (optional).
     * @returns {object} - The constructed response object.
     */
    private buildResponse(
        loadType: loadType,
        tracks: any,
        playlistName?: string,
        exceptionMsg?: string
    ): object {
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