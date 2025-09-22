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
export type loadTypeProps =
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