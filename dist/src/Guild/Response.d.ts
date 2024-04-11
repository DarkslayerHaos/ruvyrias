import { Track, TrackData } from './Track';
/** The type of load operation performed: 'track', 'playlist', 'search', 'empty', or 'error'. */
export type LoadType = 'track' | 'playlist' | 'search' | 'empty' | 'error';
/**
 * Represents the response from Lavalink when loading tracks.
 */
export interface LavalinkResponse {
    /** The type of load operation performed: 'track', 'playlist', 'search', 'empty', or 'error'. */
    loadType: LoadType;
    /** Information about the loaded playlist if applicable. */
    playlistInfo?: {
        /** The name of the playlist. */
        name?: string;
        /** The index of the selected track within the playlist. */
        selectedTrack?: number;
    };
    /** An array of tracks loaded in the response. */
    tracks: Track[];
}
/**
 * Represents information about a playlist, including its name and the index of the selected track.
 */
interface PlaylistInfo {
    /** The name of the playlist. */
    name: string;
    /** The index of the selected track within the playlist. */
    selectedTrack: number;
}
/**
 * Represents a response indicating that a single track has been loaded.
 */
export interface LoadTrackResponseTrack {
    /** The type of load, indicating it's a single track. */
    loadType: 'track';
    /** The data associated with the loaded track. */
    data: TrackData;
}
/**
 * Represents a response indicating that multiple tracks have been loaded as a search result.
 */
export interface LoadTrackResponseSearch {
    /** The type of load, indicating it's a search result. */
    loadType: 'search';
    /** An array of TrackData representing the loaded tracks. */
    data: TrackData[];
}
/**
 * Represents a response indicating that no tracks were loaded (empty).
 */
export interface LoadTrackResponseEmpty {
    /** The type of load, indicating it's an empty response. */
    loadType: 'empty';
    /** An empty object, as no tracks were loaded. */
    data: {};
}
/**
 * The severity level of a Lavalink load error.
 */
export type Severity = 'common' | 'suspicious' | 'fault';
/**
 * Represents a response indicating an error during the loading of tracks.
 */
export interface LoadTrackResponseError {
    /** The type of load, indicating it's an error response. */
    loadType: 'error';
    /** Details about the error, including an optional error message, severity, and cause. */
    data: {
        /** An optional error message providing additional information about the error. */
        message?: string;
        /** The severity of the error, categorized as 'common', 'suspicious', or 'fault'. */
        severity: Severity;
        /** A string describing the cause of the error. */
        cause: string;
    };
}
/**
 * Represents a response indicating a playlist during the loading of tracks.
 */
export interface LoadTrackResponsePlaylist {
    /** The type of load, indicating it's a playlist response. */
    loadType: 'playlist';
    /** Information about the playlist, including its name, selected track, plugin info, and an array of track data. */
    data: {
        /** Information about the playlist, such as its name and the selected track. */
        info: {
            /** The name of the playlist. */
            name: string;
            /** The index of the selected track in the playlist. */
            selectedTrack: number;
        };
        /** Additional plugin information related to the playlist. */
        pluginInfo: any;
        /** An array of track data representing the tracks in the playlist. */
        tracks: TrackData[];
    };
}
/**
 * Represents a response during the loading of tracks. It can be of different types such as a single track, search results, an empty response, an error, or a playlist.
 */
export type LoadTrackResponse = LoadTrackResponseTrack | LoadTrackResponseSearch | LoadTrackResponseEmpty | LoadTrackResponseError | LoadTrackResponsePlaylist;
/**
 * Represents a response handler for processing responses from Lavalink when loading tracks.
 * This class encapsulates the loaded tracks and provides utility methods for accessing and handling them.
 */
export declare class Response {
    tracks: Track[];
    loadType: LoadType;
    playlistInfo?: PlaylistInfo;
    constructor(response: LoadTrackResponse, requester: any);
    /**
     * Helper function to handle tracks in the Response class.
     * @param {TrackData | TrackData[]} data - The track data or an array of track data.
     * @param {any} requester - The requester object.
     * @returns {Track[]} An array of Track instances.
     */
    private handleTracks;
}
export {};
