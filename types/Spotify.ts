/**
 * Options for interacting with the Spotify API.
 */
export interface SpotifyOptions {
    /** The client ID for accessing the Spotify API. */
    clientId: string;
    /** The client secret for accessing the Spotify API. */
    clientSecret: string;
    /** Additional clients with their respective client ID and client secret for rotation. */
    clients?: { clientId: string; clientSecret: string }[];
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
export type loadTypeSPTF =
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