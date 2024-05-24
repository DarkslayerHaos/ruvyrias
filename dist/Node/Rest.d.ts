import { Node } from './Node';
import { NodeInfoResponse, NodeStatsResponse, Ruvyrias } from '../Ruvyrias';
import { Track } from '../Guild/Track';
import { Player } from '../Player/Player';
import { LoadTrackResponse, LoadType } from '../Guild/Response';
import { FiltersOptions } from '../Player/Filters';
import { IVoiceServer } from '../Player/Connection';
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
        voice?: IVoiceServer | PartialNull<IVoiceServer> | null;
    };
}
/** Represents a route path string in the format `/${string}`. */
export type RouteLike = `/${string}`;
/** Represents a partial type with nullable properties. */
export type PartialNull<T> = {
    [P in keyof T]: T[P] | null;
};
/** Represents a type that can be used for HTTP GET methods with various response types. */
export type RestMethodGet = LoadType | Track | Player | NodeInfoResponse | LoadTrackResponse | NodeStatsResponse | Player[];
/** Represents the HTTP request method types. */
export declare enum RequestMethod {
    'Get' = "GET",
    'Delete' = "DELETE",
    'Post' = "POST",
    'Patch' = "PATCH",
    'Put' = "PUT"
}
/**
 * Provides a RESTful interface for making HTTP requests to interact with the Lavalink server.
 * This class facilitates actions such as retrieving player information, updating player settings, and managing tracks.
 */
export declare class Rest {
    ruvyrias: Ruvyrias;
    url: string;
    private password;
    sessionId: string | null;
    constructor(ruvyrias: Ruvyrias, node: Node);
    /**
     * Sets the session ID for the REST instance.
     * @param {string} sessionId - The session ID to set.
     * @returns {void}
     */
    setSessionId(sessionId: string): void;
    /**
     * Gets information about all players in the session.
     * @returns {Promise<Player[] | ErrorResponses | null>} A Promise that resolves to the information about all players.
     */
    getAllPlayers(): Promise<Player[] | ErrorResponses | null>;
    /**
     * Updates a player with the specified options.
     * @param {PlayOptions} options - The options to update the player.
     * @returns {Promise<Player | ErrorResponses | null>} A Promise that resolves when the player is updated.
     */
    updatePlayer(options: PlayOptions): Promise<Player | ErrorResponses | null>;
    /**
    * Destroys a player for the specified guild.
    * @param {string} guildId - The ID of the guild for which to destroy the player.
    * @returns {Promise<null>} A Promise that resolves when the player is destroyed.
    */
    destroyPlayer(guildId: string): Promise<null>;
    /**
     * Performs an HTTP GET request to the specified path.
     * @param {RouteLike} path - The path to make the GET request.
     * @returns {Promise<RestMethodGet | null>} A Promise that resolves with the response data.
     */
    get(path: RouteLike): Promise<RestMethodGet | null>;
    /**
     * Performs an HTTP PATCH request to the specified endpoint with the provided body.
     * @param {RouteLike} endpoint - The endpoint to make the PATCH request.
     * @param {any} body - The data to include in the PATCH request body.
     * @returns {Promise<Player | null>} A Promise that resolves with the response data.
     */
    patch(endpoint: RouteLike, body: any): Promise<Player | null>;
    /**
     * Performs an HTTP POST request to the specified endpoint with the provided body.
     * @param {RouteLike} endpoint - The endpoint to make the POST request.
     * @param {any} body - The data to include in the POST request body.
     * @returns {Promise<Track[] | null>} A Promise that resolves with the response data.
     */
    post(endpoint: RouteLike, body: any): Promise<Track[] | null>;
    /**
     * Performs an HTTP DELETE request to the specified endpoint.
     * @param {RouteLike} endpoint - The endpoint to make the DELETE request.
     * @returns {Promise<null>} A Promise that resolves with the response data.
     */
    delete(endpoint: RouteLike): Promise<null>;
    /**
     * This function will get the RoutePlanner status
     * @returns {Promise<unknown>}
     */
    getRoutePlannerStatus(): Promise<unknown>;
    /**
     * This function will Unmark a failed address
     * @param {string} address The address to unmark as failed. This address must be in the same ip block.
     * @returns {ErrorResponses | unknown} This function will most likely error if you havn't enabled the route planner
     */
    unmarkFailedAddress(address: string): Promise<ErrorResponses | unknown>;
}
