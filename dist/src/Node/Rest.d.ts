import { Node } from './Node';
import { NodeInfoResponse, NodeStatsResponse, Ruvyrias } from '../Ruvyrias';
import { Track } from '../Guild/Track';
import { Player } from '../Player/Player';
import { LoadTrackResponse, LoadType } from '../Guild/Response';
/**
 * Represents the options for playing audio in a guild.
 */
export interface PlayOptions {
    guildId: string;
    data: {
        track?: any;
        identifier?: string;
        startTime?: number;
        endTime?: number;
        volume?: number;
        position?: number;
        paused?: Boolean;
        filters?: Object;
        voice?: any;
    };
}
/** Represents a route path string in the format `/${string}`. */
export type RouteLike = `/${string}`;
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
export declare class Rest {
    ruvyrias: Ruvyrias;
    url: string;
    private sessionId;
    private password;
    constructor(ruvyrias: Ruvyrias, node: Node);
    /**
     * Sets the session ID for the REST instance.
     * @param {string} sessionId - The session ID to set.
     * @returns {void}
     */
    setSessionId(sessionId: string): void;
    /**
     * Gets information about all players in the session.
     * @returns {Promise<Player[]>} A Promise that resolves to the information about all players.
     */
    getAllPlayers(): Promise<Player[]>;
    /**
     * Updates a player with the specified options.
     * @param {PlayOptions} options - The options to update the player.
     * @returns {Promise<Player>} A Promise that resolves when the player is updated.
     */
    updatePlayer(options: PlayOptions): Promise<Player>;
    /**
    * Destroys a player for the specified guild.
    * @param {string} guildId - The ID of the guild for which to destroy the player.
    * @returns {Promise<unknown>} A Promise that resolves when the player is destroyed.
    */
    destroyPlayer(guildId: string): Promise<unknown>;
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
     * @returns {Promise<Player>} A Promise that resolves with the response data.
     */
    patch(endpoint: RouteLike, body: any): Promise<Player>;
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
}
