import { Ruvyrias } from '../../src/Ruvyrias';
import { Plugin } from '../../src/Plugin';
import { SpotifyManager } from './SpotifyManager';
/**
 * Options for interacting with the Spotify API.
 */
export interface SpotifyOptions {
    /** The client ID for accessing the Spotify API. */
    clientID: string;
    /** The client secret for accessing the Spotify API. */
    clientSecret: string;
    /** Additional clients with their respective client ID and client secret for rotation. */
    clients?: {
        clientID: string;
        clientSecret: string;
    }[];
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
export type loadType = 'track' | 'playlist' | 'search' | 'empty' | 'error';
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
        artists: Omit<SpotifyArtist, 'followers' | 'images' | 'genres' | 'popularity'>;
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
export interface SpotifyArtist extends Omit<SpotifyUser, 'display_name' | 'type'> {
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
/**
 * Represents a Spotify public credentials.
 */
export interface SpotifyPublicCredentials {
    clientId: string;
    accessToken: string;
    accessTokenExpirationTimestampMs: number;
    isAnonymous: boolean;
}
export interface Seed {
    initialPoolSize: number;
    afterFilteringSize: number;
    afterRelinkingSize: number;
    id: string;
    type: string;
    href: string;
}
export interface SpotifyData {
    tracks: SpotifyTrack[];
    seeds: Seed[];
}
export declare class Spotify extends Plugin {
    private baseURL;
    ruvyrias: Ruvyrias;
    options: SpotifyOptions;
    private _resolve;
    spotifyManager: SpotifyManager;
    constructor(options: Omit<SpotifyOptions, 'authorization' | 'interval' | 'token'>);
    /**
     * Checks if the provided URL is a Spotify URL.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL is a Spotify URL, false otherwise.
     */
    private check;
    /**
     * Loads the Spotify plugin into the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance.
     */
    load(ruvyrias: Ruvyrias): Promise<void>;
    /**
     * Requests an access token from the Spotify API using client credentials.
     * @returns {Promise<void>} - A promise that resolves when the token is successfully requested and set.
     */
    private requestToken;
    /**
     * Resolves a Spotify query, handling various types such as playlists, tracks, albums, and artists.
     * If a token is not available, it requests one using client credentials.
     * @param {ResolveOptions} options - The resolve options including query, source, and requester.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private resolve;
    /**
     * Decodes a Spotify short link and resolves the resulting Spotify URL.
     * @param {ResolveOptions} options - The resolve options including query, source, and requester.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private decodeSpotifyShortLink;
    /**
     * Fetches a playlist from Spotify and resolves its tracks.
     * @param {string} id - The ID of the playlist.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private fetchPlaylist;
    /**
     * Fetches an album from Spotify and resolves its tracks.
     * @param {string} id - The ID of the album.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private fetchAlbum;
    /**
     * Fetches an artist from Spotify and resolves their top tracks.
     * @param {string} id - The ID of the artist.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private fetchArtist;
    /**
     * Fetches a track from Spotify and resolves it.
     * @param {string} id - The ID of the track.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private fetchTrack;
    /**
     * Fetches data from Spotify based on the provided query, source, and requester information.
     * @param {string} query - The search query.
     * @param {string} source - The source of the request.
     * @param {any} requester - The requester information.
     * @returns {Promise<any>} - The resolved data from the Spotify API.
     */
    private fetch;
    /**
     * Fetches additional tracks for a Spotify playlist.
     * @param {SpotifyPlaylist} spotifyPlaylist - The Spotify playlist object.
     * @returns {Promise<void>} - A Promise that resolves when the tracks are fetched.
     */
    private fetchPlaylistTracks;
    /**
     * Builds an unresolved Track object based on the provided Spotify track and requester information.
     * @param {SpotifyTrack} track - The Spotify track object.
     * @param {any} requester - The requester information.
     * @returns {Promise<Track>} - The unresolved Track object.
     */
    private buildUnresolved;
    /**
     * Builds a response object based on the provided loadType, tracks, playlistName, and exception message.
     * @param {loadType} loadType - The type of data being loaded.
     * @param {any} tracks - The tracks data.
     * @param {string} playlistName - The name of the playlist (optional).
     * @param {string} exceptionMsg - The exception message (optional).
     * @returns {any} - The built response object.
     */
    private buildResponse;
}
