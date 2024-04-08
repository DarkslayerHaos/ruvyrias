import { Ruvyrias } from '../../src/Ruvyrias';
import { Plugin } from '../../src/Plugin';
/**
 * Represents the different types of load operations.
 */
export type loadType = 'track' | 'playlist' | 'search' | 'empty' | 'error';
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
    data: any;
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
export declare class Deezer extends Plugin {
    private baseURL;
    private ruvyrias;
    private _resolve;
    constructor();
    /**
     * Overrides the load method of the Plugin class, enabling the Deezer plugin to interact with the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance.
     */
    load(ruvyrias: Ruvyrias): Promise<void>;
    /**
     * Checks if the provided URL matches the Deezer regex pattern.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL matches the Deezer regex pattern, false otherwise.
     */
    private check;
    /**
     * Checks if the provided URL is a Deezer share link.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL is a Deezer share link, false otherwise.
     */
    private isDeezerShareLink;
    /**
     * Resolves a track, album, playlist, or artist from Deezer based on the provided query, source, and requester.
     * @param {ResolveOptions} options - The options for resolving a track.
     * @returns {Promise<unknown>} - A promise that resolves to the result of the Deezer resolution.
     */
    private resolve;
    /**
     * Retrieves information about a Deezer track based on the provided ID and requester.
     * @param {string} id - The ID of the Deezer track.
     * @param {any} requester - The requester of the track information.
     * @returns {Promise<DeezerTrack | object>} - A promise that resolves to the Deezer track information.
     */
    private getTrack;
    /**
     * Retrieves information about a Deezer playlist based on the provided ID and requester.
     * @param {string} id - The ID of the Deezer playlist.
     * @param {any} requester - The requester of the playlist information.
     * @returns {Promise<object>} - A promise that resolves to the Deezer playlist information.
     */
    private getPlaylist;
    /**
     * Retrieves information about a Deezer artist based on the provided ID and requester.
     * @param {string} id - The ID of the Deezer artist.
     * @param {any} requester - The requester of the artist information.
     * @returns {Promise<DeezerArtist | object>} - A promise that resolves to the Deezer artist information.
     */
    private getArtist;
    /**
     * Retrieves additional tracks for a Deezer artist to ensure a comprehensive list.
     * @param {any} deezerArtist - The Deezer artist object containing track information.
     * @returns {Promise<void>} - A promise that resolves once additional tracks are loaded.
     */
    private getArtistTracks;
    /**
     * Retrieves Deezer tracks based on a search query and requester.
     * @param {any} query - The search query.
     * @param {any} requester - The requester for the tracks.
     * @returns {Promise<unknown>} - A promise that resolves to Deezer tracks based on the search query.
     */
    private getQuerySong;
    /**
     * Retrieves Deezer album tracks based on the album ID and requester.
     * @param {string} id - The ID of the Deezer album.
     * @param {any} requester - The requester for the album tracks.
     * @returns {Promise<DeezerAlbum | object>} - A promise that resolves to Deezer album tracks based on the album ID.
     */
    private getAlbum;
    /**
     * Decodes a Deezer share link to obtain the original URL.
     * @param {string} url - The Deezer share link to decode.
     * @returns {Promise<string | undefined>} - A promise that resolves to the original URL after decoding the Deezer share link.
     */
    private decodeDeezerShareLink;
    /**
     * Fetches data from the Deezer API based on the specified endpoint.
     * @param {string} endpoint - The Deezer API endpoint to retrieve data from.
     * @returns {Promise<unknown>} - A promise that resolves to the data fetched from the Deezer API.
     */
    private getData;
    /**
     * Builds an unresolved track using the provided Deezer track object and requester.
     * @param {DeezerTrack} track - The Deezer track object.
     * @param {any} requester - The requester for the track.
     * @returns {Promise<Track>} - An unresolved Track instance representing the Deezer track.
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
