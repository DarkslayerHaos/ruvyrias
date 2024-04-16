"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rest = exports.RequestMethod = void 0;
/** Represents the HTTP request method types. */
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["Get"] = "GET";
    RequestMethod["Delete"] = "DELETE";
    RequestMethod["Post"] = "POST";
    RequestMethod["Patch"] = "PATCH";
    RequestMethod["Put"] = "PUT";
})(RequestMethod || (exports.RequestMethod = RequestMethod = {}));
/**
 * Provides a RESTful interface for making HTTP requests to interact with the Lavalink server.
 * This class facilitates actions such as retrieving player information, updating player settings, and managing tracks.
 */
class Rest {
    ruvyrias;
    url;
    password;
    sessionId;
    constructor(ruvyrias, node) {
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
    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }
    /**
     * Gets information about all players in the session.
     * @returns {Promise<Player[] | ErrorResponses | null>} A Promise that resolves to the information about all players.
     */
    async getAllPlayers() {
        return await this.get(`/v4/sessions/${this.sessionId}/players`);
    }
    /**
     * Updates a player with the specified options.
     * @param {PlayOptions} options - The options to update the player.
     * @returns {Promise<Player | ErrorResponses | null>} A Promise that resolves when the player is updated.
     */
    async updatePlayer(options) {
        return await this.patch(`/v4/sessions/${this.sessionId}/players/${options.guildId}?noReplace=false`, options.data);
    }
    /**
    * Destroys a player for the specified guild.
    * @param {string} guildId - The ID of the guild for which to destroy the player.
    * @returns {Promise<null>} A Promise that resolves when the player is destroyed.
    */
    async destroyPlayer(guildId) {
        return await this.delete(`/v4/sessions/${this.sessionId}/players/${guildId}`);
    }
    /**
     * Performs an HTTP GET request to the specified path.
     * @param {RouteLike} path - The path to make the GET request.
     * @returns {Promise<RestMethodGet | null>} A Promise that resolves with the response data.
     */
    async get(path) {
        try {
            const req = await fetch(this.url + path, {
                method: RequestMethod.Get,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.password,
                },
            });
            return req.headers.get('content-type') === 'application/json' ? await req.json() : await req.text();
        }
        catch (e) {
            throw new Error('Failed to get data');
        }
    }
    /**
     * Performs an HTTP PATCH request to the specified endpoint with the provided body.
     * @param {RouteLike} endpoint - The endpoint to make the PATCH request.
     * @param {any} body - The data to include in the PATCH request body.
     * @returns {Promise<Player | null>} A Promise that resolves with the response data.
     */
    async patch(endpoint, body) {
        try {
            const req = await fetch(this.url + endpoint, {
                method: RequestMethod.Patch,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.password,
                },
                body: JSON.stringify(body),
            });
            return await req.json();
        }
        catch (e) {
            throw new Error('Failed to patch data');
        }
    }
    /**
     * Performs an HTTP POST request to the specified endpoint with the provided body.
     * @param {RouteLike} endpoint - The endpoint to make the POST request.
     * @param {any} body - The data to include in the POST request body.
     * @returns {Promise<Track[] | null>} A Promise that resolves with the response data.
     */
    async post(endpoint, body) {
        try {
            const req = await fetch(this.url + endpoint, {
                method: RequestMethod.Post,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.password,
                },
                body: JSON.stringify(body),
            });
            return await req.json();
        }
        catch (e) {
            return null;
        }
    }
    /**
     * Performs an HTTP DELETE request to the specified endpoint.
     * @param {RouteLike} endpoint - The endpoint to make the DELETE request.
     * @returns {Promise<null>} A Promise that resolves with the response data.
     */
    async delete(endpoint) {
        try {
            const req = await fetch(this.url + endpoint, {
                method: RequestMethod.Delete,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.password,
                },
            });
            return await req.json();
        }
        catch (e) {
            return null;
        }
    }
    /**
     * This function will get the RoutePlanner status
     * @returns {Promise<unknown>}
     */
    async getRoutePlannerStatus() {
        return await this.get(`/v4/routeplanner/status`);
    }
    /**
     * This function will Unmark a failed address
     * @param {string} address The address to unmark as failed. This address must be in the same ip block.
     * @returns {ErrorResponses | unknown} This function will most likely error if you havn't enabled the route planner
     */
    async unmarkFailedAddress(address) {
        return this.post(`/v4/routeplanner/free/address`, { address });
    }
}
exports.Rest = Rest;
