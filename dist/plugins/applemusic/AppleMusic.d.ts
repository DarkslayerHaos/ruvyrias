import { Ruvyrias } from '../../src/Ruvyrias';
import { Plugin } from '../../src/Plugin';
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
export type loadType = 'track' | 'playlist' | 'search' | 'empty' | 'error';
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
export declare class AppleMusic extends Plugin {
    private ruvyrias;
    private options;
    private _resolve;
    constructor(options: Omit<AppleMusicOptions, 'fetchURL' | 'token'>);
    /**
     * Overrides the load method of the Plugin class, enabling the Apple Music plugin to interact with the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance.
     */
    load(ruvyrias: Ruvyrias): Promise<void>;
    /**
     * Checks if the provided URL matches the Apple Music regex pattern.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL matches the Apple Music regex pattern, false otherwise.
     */
    private check;
    /**
     * Fetches data from the Apple Music API based on the provided parameters.
     * @param {string} params - The parameters to be included in the API request URL.
     * @returns {Promise<any>} - A promise that resolves to the fetched data from the Apple Music API.
     */
    private getData;
    /**
     * Resolves a track, album, playlist, or artist from Apple Music based on the provided query, source, and requester.
     * @param {ResolveOptions} options - The options for resolving a track.
     * @returns {Promise<unknown>} - A promise that resolves to the result of the Apple Music resolution.
     */
    private resolve;
    /**
     * Fetches data for a playlist from Apple Music.
     * @param {string} url - The URL of the playlist.
     * @param {any} requester - The requester of the data.
     * @returns {Promise<object>} - A promise that resolves to the playlist data.
     */
    private getPlaylist;
    /**
     * Fetches data for an artist from Apple Music.
     * @param {string} url - The URL of the artist.
     * @param {any} requester - The requester of the data.
     * @returns {Promise<object>} - A promise that resolves to the artist data.
     */
    private getArtist;
    /**
     * Fetches data for an album from Apple Music.
     * @param {string} url - The URL of the album.
     * @param {any} requester - The requester of the data.
     * @returns {Promise<object>} - A promise that resolves to the album data.
     */
    private getAlbum;
    /**
     * Searches for a song on Apple Music.
     * @param {string} query - The search query.
     * @param {any} requester - The requester of the data.
     * @returns {Promise<AppleMusicTrack | object>} - A promise that resolves to the search results.
     */
    private searchSong;
    /**
     * Builds an unresolved track using the provided Apple Music track object and requester.
     * @param {AppleMusicTrack} track - The Apple Music track object.
     * @param {any} requester - The requester for the track.
     * @returns {Promise<Track>} - An unresolved Track instance representing the Apple Music track.
     */
    private buildUnresolved;
    /**
     * Builds a response object based on the specified parameters.
     * @param {loadType} loadType - The load type of the response.
     * @param {any} tracks - The tracks associated with the response.
     * @param {string | undefined} playlistName - The name of the playlist (optional).
     * @param {string | undefined} exceptionMsg - The exception message (optional).
     * @returns {object} - The constructed response object.
     */
    private buildResponse;
}
