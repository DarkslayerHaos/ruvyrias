import { Ruvyrias, ResolveOptions } from '../../src/Ruvyrias';
import { Track } from '../../src/Guild/Track';
import { Plugin } from '../../src/Plugin';
const URL_PATTERN =
    /(?:https:\/\/music\.apple\.com\/)([a-z]{2}\/)?(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/;

/**
 * Represents options for fetching Apple Music data.
 */
export interface AppleMusicOptions {
    /** The country code for the Apple Music store to be used for fetching data. */
    countryCode: string;
    /** The API key required for accessing Apple Music resources. */
    apiKey: string;
    /** The desired width for fetched images. */
    imageWidth?: number;
    /** The desired height for fetched images. */
    imageHeight?: number;
    /** The custom URL used for fetching Apple Music data. */
    fetchURL?: string;
    /** The authentication token for accessing Apple Music resources. */
    token?: string;
}

/**
 * Types for the different load scenarios in the Apple Music plugin.
 */
export type loadType =
    | 'track'
    | 'playlist'
    | 'search'
    | 'empty'
    | 'error';

/**
 * Represents a track in the Apple Music API.
 */
export interface AppleMusicTrack {
    id: string;
    type: string;
    href: string;
    attributes: {
        hasTimeSyncedLyrics: boolean;
        albumName: string;
        genreNames: string[];
        trackNumber: number;
        durationInMillis: number;
        releaseDate: string;
        isVocalAttenuationAllowed: boolean;
        isMasteredForItunes: boolean;
        isrc: string;
        artwork: {
            width: number;
            url: string;
            height: number;
            textColor3: string;
            textColor2: string;
            textColor4: string;
            textColor1: string;
            bgColor: string;
            hasP3: boolean;
        };
        composerName: string;
        audioLocale: string;
        url: string;
        playParams: {
            id: string;
            kind: string;
        };
        discNumber: number;
        hasCredits: boolean;
        isAppleDigitalMaster: boolean;
        hasLyrics: boolean;
        audioTraits: string[];
        name: string;
        previews: {
            [key: string]: any;
        }[];
        artistName: string;
    };
}

/**
 * Represents the Apple Music class, extending the base Plugin class.
 */
export class AppleMusic extends Plugin {
    private baseURL: 'https://api.music.apple.com/v1/';
    private ruvyrias: Ruvyrias;
    private options: AppleMusicOptions;
    private _resolve!: ({ query, source, requester }: ResolveOptions) => any;
    constructor(options: Omit<AppleMusicOptions, 'fetchURL' | 'token'>) {
        super('AppleMusic');
        if (!options?.countryCode) {
            throw new Error(`[Apple Music Options] CountryCode option must be included, for example: "us"`);
        }
        this.options = {
            countryCode: options?.countryCode,
            apiKey: options?.apiKey,
            imageWidth: options?.imageWidth ?? 900,
            imageHeight: options?.imageHeight ?? 500,
            fetchURL: `https://amp-api.music.apple.com/v1/catalog/${options?.countryCode}`,
            token: `Bearer ${options.apiKey}`,
        };
    }

    /**
     * Overrides the load method of the Plugin class, enabling the Apple Music plugin to interact with the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance.
     */
    public async load(ruvyrias: Ruvyrias) {
        this.ruvyrias = ruvyrias;
        this._resolve = ruvyrias.resolve.bind(ruvyrias);
        ruvyrias.resolve = this.resolve.bind(this);
    }

    /**
     * Checks if the provided URL matches the Apple Music regex pattern.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL matches the Apple Music regex pattern, false otherwise.
     */
    private check(url: string): boolean {
        return URL_PATTERN.test(url);
    }

    /**
     * Fetches data from the Apple Music API based on the provided parameters.
     * @param {string} params - The parameters to be included in the API request URL.
     * @returns {Promise<any>} - A promise that resolves to the fetched data from the Apple Music API.
     */
    private async getData(params: string): Promise<any> {
        const req = await fetch(`${this.options.fetchURL}${params}`, {
            headers: {
                'Authorization': this.options.token,
                'Origin': 'https://music.apple.com',
            },
        });

        const body = await req.json();

        return body;
    }

    /**
     * Resolves a track, album, playlist, or artist from Apple Music based on the provided query, source, and requester.
     * @param {ResolveOptions} options - The options for resolving a track.
     * @returns {Promise<unknown>} - A promise that resolves to the result of the Apple Music resolution.
     */
    private async resolve({ query, source, requester }: ResolveOptions): Promise<unknown> {
        if (source === 'amsearch' && !this.check(query)) {
            return this.searchSong(query, requester);
        }

        if (!this.check(query)) {
            return this._resolve({ query, source: source ?? this?.ruvyrias.options.defaultPlatform, requester: requester });
        }

        const [, , type] = URL_PATTERN.exec(query);
        switch (type) {
            case 'album': {
                return this.getAlbum(query, requester);
            }
            case 'playlist': {
                return this.getPlaylist(query, requester);
            }
            case 'artist': {
                return this.getArtist(query, requester);
            }
        }
    }

    /**
     * Fetches data for a playlist from Apple Music.
     * @param {string} url - The URL of the playlist.
     * @param {any} requester - The requester of the data.
     * @returns {Promise<object>} - A promise that resolves to the playlist data.
     */
    private async getPlaylist(url: string, requester: any): Promise<object> {
        const query = new URL(url).pathname.split('/');
        const id = query.pop();
        try {
            const playlist: any = await this.getData(`/playlists/${id}`);
            const name = playlist.data[0].attributes.name;
            const tracks = playlist.data[0]?.relationships.tracks.data;
            const unresolvedTracks = await Promise.all(await tracks.map((x: AppleMusicTrack) => this.buildUnresolved(x, requester)));

            return this.buildResponse('playlist', unresolvedTracks, name);
        } catch (e) {
            return this.buildResponse(
                'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Fetches data for an artist from Apple Music.
     * @param {string} url - The URL of the artist.
     * @param {any} requester - The requester of the data.
     * @returns {Promise<object>} - A promise that resolves to the artist data.
     */
    private async getArtist(url: string, requester: any): Promise<object> {
        const query = new URL(url).pathname.split('/');
        const id = query.pop();
        try {
            const artist = await this.getData(`/artists/${id}/view/top-songs`);
            const name = `${artist.data[0].attributes.artistName}'s top songs`;
            const tracks = await artist.data;
            const unresolvedTracks = await Promise.all(await tracks.map((x: AppleMusicTrack) => this.buildUnresolved(x, requester)));

            return this.buildResponse('playlist', unresolvedTracks, name);
        } catch (e) {
            return this.buildResponse(
                'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Fetches data for an album from Apple Music.
     * @param {string} url - The URL of the album.
     * @param {any} requester - The requester of the data.
     * @returns {Promise<object>} - A promise that resolves to the album data.
     */
    private async getAlbum(url: string, requester: any): Promise<object> {
        const query = new URL(url).pathname.split('/');
        const id = query.pop();
        try {
            const album = await this.getData(`/albums/${id}`);
            const name = album.data[0].attributes.name;
            const tracks = await album.data[0].relationships.tracks.data;
            const unresolvedTracks = await Promise.all(await tracks.map((x: AppleMusicTrack) => this.buildUnresolved(x, requester)));

            return this.buildResponse('playlist', unresolvedTracks, name);
        } catch (e) {
            return this.buildResponse(
                'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Searches for a song on Apple Music.
     * @param {string} query - The search query.
     * @param {any} requester - The requester of the data.
     * @returns {Promise<AppleMusicTrack | object>} - A promise that resolves to the search results.
     */
    private async searchSong(query: string, requester: any): Promise<AppleMusicTrack | object> {
        try {
            const tracks = await this.getData(`/search?types=songs&term=${query}`);
            const unresolvedTracks = await Promise.all(tracks.results.songs.data.map((x: AppleMusicTrack) => this.buildUnresolved(x, requester)));

            return this.buildResponse('track', unresolvedTracks);
        } catch (e) {
            return this.buildResponse(
                'error',
                [],
                undefined,
                e.body?.error.message ?? e.message
            );
        }
    }

    /**
     * Builds an unresolved track using the provided Apple Music track object and requester.
     * @param {AppleMusicTrack} track - The Apple Music track object.
     * @param {any} requester - The requester for the track.
     * @returns {Promise<Track>} - An unresolved Track instance representing the Apple Music track.
     */
    private async buildUnresolved(track: AppleMusicTrack, requester: any): Promise<Track> {
        if (!track) throw new ReferenceError('The AppleMusic track object was not provided');

        const artworkURL = new String(track.attributes.artwork.url)
            .replace('{w}', String(this.options.imageWidth))
            .replace('{h}', String(this.options.imageHeight));

        return new Track(
            {
                encoded: '',
                info: {
                    sourceName: 'applemusic',
                    identifier: track.id,
                    title: track.attributes.name,
                    author: track.attributes?.composerName ?? 'Unknown Artist',
                    album: track.attributes?.albumName,
                    uri: track.attributes?.url,
                    artworkUrl: artworkURL,
                    isrc: track.attributes?.isrc,
                    length: track.attributes?.durationInMillis ?? 0,
                    isSeekable: true,
                    isStream: false,
                },
                pluginInfo: null,
                userData: {}
            },
            requester
        );
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
