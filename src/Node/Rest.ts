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

/**
 * Provides a RESTful interface for making HTTP requests to interact with the Lavalink server.
 * This class facilitates actions such as retrieving player information, updating player settings, and managing tracks.
 */
export class Rest {
    public ruvyrias: Ruvyrias;
    public url: string;
    private password: string;
    public sessionId: string | null;

    constructor(ruvyrias: Ruvyrias, node: Node) {
        this.ruvyrias = ruvyrias;
        this.url = `http${node.options.secure ? 's' : ''}://${node.options.host}:${node.options.port}`;
        this.password = node.options.password;
        this.sessionId = null;
    }

    /**
     * Sets the session ID for the REST instance.
     * @param {string} sessionId - The session ID to set.
     * @returns {void}
     */
    public setSessionId(sessionId: string): void {
        this.sessionId = sessionId;
    }

    /**
     * Gets information about all players in the session.
     * @returns {Promise<Player[] | ErrorResponses | null>} A Promise that resolves to the information about all players.
     */
    public async getAllPlayers(): Promise<Player[] | ErrorResponses | null> {
        return await this.get(`/v4/sessions/${this.sessionId}/players`) as Player[];
    }

    /**
     * Updates a player with the specified options.
     * @param {PlayOptions} options - The options to update the player.
     * @returns {Promise<Player | ErrorResponses | null>} A Promise that resolves when the player is updated.
     */
    public async updatePlayer(options: PlayOptions): Promise<Player | ErrorResponses | null> {
        return await this.patch(`/v4/sessions/${this.sessionId}/players/${options.guildId}?noReplace=false`, options.data) as Player;
    }

    /**
    * Destroys a player for the specified guild.
    * @param {string} guildId - The ID of the guild for which to destroy the player.
    * @returns {Promise<null>} A Promise that resolves when the player is destroyed.
    */
    public async destroyPlayer(guildId: string): Promise<null> {
        return await this.delete(`/v4/sessions/${this.sessionId}/players/${guildId}`);
    }

    /**
     * Performs an HTTP GET request to the specified path.
     * @param {RouteLike} path - The path to make the GET request.
     * @returns {Promise<RestMethodGet | null>} A Promise that resolves with the response data.
     */
    public async get(path: RouteLike): Promise<RestMethodGet | null> {
        try {
            const req = await fetch(this.url + path, {
                method: RequestMethod.Get,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.password,
                },
            });
            return req.headers.get('content-type') === 'application/json' ? await req.json() as RestMethodGet : await req.text() as RestMethodGet;
        } catch (e) {
            throw new Error('Failed to get data');
        }
    }

    /**
     * Performs an HTTP PATCH request to the specified endpoint with the provided body.
     * @param {RouteLike} endpoint - The endpoint to make the PATCH request.
     * @param {any} body - The data to include in the PATCH request body.
     * @returns {Promise<Player | null>} A Promise that resolves with the response data.
     */
    public async patch(endpoint: RouteLike, body: any): Promise<Player | null> {
        try {
            const req = await fetch(this.url + endpoint, {
                method: RequestMethod.Patch,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.password,
                },
                body: JSON.stringify(body),
            });

            return await req.json() as Player;
        } catch (e) {
            throw new Error('Failed to patch data');
        }
    }

    /**
     * Performs an HTTP POST request to the specified endpoint with the provided body.
     * @param {RouteLike} endpoint - The endpoint to make the POST request.
     * @param {any} body - The data to include in the POST request body.
     * @returns {Promise<Track[] | null>} A Promise that resolves with the response data.
     */
    public async post(endpoint: RouteLike, body: any): Promise<Track[] | null> {
        try {
            const req = await fetch(this.url + endpoint, {
                method: RequestMethod.Post,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.password,
                },
                body: JSON.stringify(body),
            });

            return await req.json() as Track[] | null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Performs an HTTP DELETE request to the specified endpoint.
     * @param {RouteLike} endpoint - The endpoint to make the DELETE request.
     * @returns {Promise<null>} A Promise that resolves with the response data.
     */
    public async delete(endpoint: RouteLike): Promise<null> {
        try {
            const req = await fetch(this.url + endpoint, {
                method: RequestMethod.Delete,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.password,
                },
            });

            return await req.json() as null;
        } catch (e) {
            return null;
        }
    }

    /**
     * This function will get the RoutePlanner status
     * @returns {Promise<unknown>}
     */
    public async getRoutePlannerStatus(): Promise<unknown> {
        return await this.get(`/v4/routeplanner/status`);
    }

    /**
     * This function will Unmark a failed address
     * @param {string} address The address to unmark as failed. This address must be in the same ip block.
     * @returns {ErrorResponses | unknown} This function will most likely error if you havn't enabled the route planner
     */
    public async unmarkFailedAddress(address: string): Promise<ErrorResponses | unknown> {
        return this.post(`/v4/routeplanner/free/address`, { address });
    }
}