import { NodeInfoResponse, NodeStatsResponse } from './Ruvyrias';
import { LoadType, LoadTrackResponse } from './Response';
import { VoiceServer } from './Connection';
import { FiltersOptions } from './Filters';
import { Player } from '../src/Player';
import { Track } from '../src/Track';

/**
 * This interface represents the LavaLink V4 Error Responses
 * @reference https://lavalink.dev/api/rest.html#error-responses
 */
export interface ErrorResponses {
    timestamp: number;
    status: number;
    error: string;
    trace?: string;
    message: string;
    path: string;
}

/**
 * Represents the options for playing audio in a guild.
 */
export interface PlayOptions {
    guildId: string;
    data: {
        track?: {
            encoded?: string | null;
            identifier?: string;
            userData?: object;
            requester?: any;
        };
        identifier?: string;
        startTime?: number;
        endTime?: number;
        volume?: number;
        position?: number;
        paused?: boolean;
        filters?: Partial<FiltersOptions>;
        voice?: VoiceServer | PartialNull<VoiceServer> | null;
    };
}

/** Represents a route path string in the format `/${string}`. */
export type RouteLike = `/${string}`;

/** Represents a partial type with nullable properties. */
export type PartialNull<T> = { [P in keyof T]: T[P] | null };

/** Represents a type that can be used for HTTP GET methods with various response types. */
export type RestMethodGet =
    | LoadType
    | Track
    | Player
    | NodeInfoResponse
    | LoadTrackResponse
    | NodeStatsResponse
    | Player[];

/** Represents the HTTP request method types. */
export enum RequestMethod {
    'Get' = 'GET',
    'Delete' = 'DELETE',
    'Post' = 'POST',
    'Patch' = 'PATCH',
    'Put' = 'PUT',
}