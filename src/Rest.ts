import { ErrorResponses, PlayOptions, RouteLike, RestMethodGet, RequestMethod } from '../types';
import { Ruvyrias } from './Ruvyrias';
import { Player } from './Player';
import { Track } from './Track';
import { Node } from './Node';

/**
 * Provides a RESTful interface for making HTTP requests to interact with the Lavalink server.
 * This class facilitates actions such as retrieving player information, updating player settings, and managing tracks.
 */
export class Rest {
    public readonly ruvyrias: Ruvyrias;
    public readonly url: string;
    private readonly password: string;
    public sessionId: string | null;

    constructor(ruvyrias: Ruvyrias, node: Node) {
        this.ruvyrias = ruvyrias;
        this.url = `http${node.options.secure ? 's' : ''}://${node.options.host}:${node.options.port}`;
        this.password = node.options.auth;
        this.sessionId = null;
    }

    /**
     * Sets the session ID for the REST instance, used in subsequent requests.
     *
     * @param {string} sessionId - The session ID to assign to this REST instance.
     * @returns {void}
     */
    public setSessionId(sessionId: string): void {
        this.sessionId = sessionId;
    }

    /**
     * Retrieves information about all players in the current session.
     *
     * @returns {Promise<Player[] | ErrorResponses | null>} A Promise resolving to an array of players,
     * an error response, or null if no players exist.
     */
    public async getAllPlayers(): Promise<Player[] | ErrorResponses | null> {
        return await this.get(`/v4/sessions/${this.sessionId}/players`) as Player[];
    }

    /**
     * Updates a player with the provided options.
     *
     * @param {PlayOptions} options - Options including guildId and data to update the player.
     * @returns {Promise<Player | ErrorResponses | null>} A Promise resolving to the updated player, 
     * an error response, or null if the update failed.
     */
    public async updatePlayer(options: PlayOptions): Promise<Player | ErrorResponses | null> {
        return await this.patch(`/v4/sessions/${this.sessionId}/players/${options.guildId}?noReplace=false`, options.data) as Player;
    }

    /**
     * Destroys the player associated with the specified guild ID.
     *
     * @param {string} guildId - The ID of the guild whose player should be destroyed.
     * @returns {Promise<null>} A Promise that resolves once the player is removed.
     */
    public async deletePlayer(guildId: string): Promise<null> {
        return await this.delete(`/v4/sessions/${this.sessionId}/players/${guildId}`);
    }

    /**
     * Performs an HTTP GET request to the given path.
     *
     * @param {RouteLike} path - The endpoint path for the GET request.
     * @returns {Promise<RestMethodGet | null>} A Promise resolving with the server response data
     * or null if the request fails.
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
     * Performs an HTTP PATCH request to the given endpoint with the provided data.
     *
     * @param {RouteLike} endpoint - The endpoint to patch.
     * @param {any} body - The data to send in the PATCH request.
     * @returns {Promise<Player | null>} A Promise resolving to the updated player or null if the request fails.
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
     * Performs an HTTP POST request to the given endpoint with the provided data.
     *
     * @param {RouteLike} endpoint - The endpoint to send the POST request to.
     * @param {any} body - The data to include in the POST request body.
     * @returns {Promise<Track[] | null>} A Promise resolving to an array of tracks or null if the request fails.
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
     * Performs an HTTP DELETE request to the given endpoint.
     *
     * @param {RouteLike} endpoint - The endpoint to send the DELETE request to.
     * @returns {Promise<null>} A Promise that resolves once the deletion is complete, or null on failure.
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
     * Retrieves the status of the Lavalink RoutePlanner.
     *
     * @returns {Promise<unknown>} A Promise resolving with the route planner status information.
     */
    public async getRoutePlannerStatus(): Promise<unknown> {
        return await this.get(`/v4/routeplanner/status`);
    }

    /**
     * Unmarks a failed IP address in the RoutePlanner, freeing it for use.
     *
     * @param {string} address - The address to unmark as failed (must be in the same IP block).
     * @returns {Promise<ErrorResponses | unknown>} A Promise resolving with the response or an error if the route planner is not enabled.
     */
    public async unmarkFailedAddress(address: string): Promise<ErrorResponses | unknown> {
        return this.post(`/v4/routeplanner/free/address`, { address });
    }
}