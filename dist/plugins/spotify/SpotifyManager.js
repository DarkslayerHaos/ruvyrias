"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyManager = void 0;
const RestManager_1 = require("./RestManager");
const errorMessage = '[Ruvyrias Spotify] your all spotify clientID are ratelimited try to add more clientID due to you have high usage';
/**
 * Manages interactions with the Spotify API, handling single or multiple client configurations.
 */
class SpotifyManager {
    mode = 'single';
    manager;
    /**
     * @param {SpotifyOptions} data - The Spotify client configuration data.
     */
    constructor(data) {
        this.manager = [];
        if (data.clients?.length) {
            for (const client of data.clients)
                this.manager?.push(new RestManager_1.RestManager(client));
            this.mode = 'multiple';
        }
        else {
            this.manager.push(new RestManager_1.RestManager({ clientID: data.clientID, clientSecret: data.clientSecret }));
        }
    }
    /**
     * Sends a generic request to the Spotify API.
     *
     * @param {string} endpoint - The API endpoint to send the request to.
     * @returns {Promise<T>} - A promise resolving to the response data.
     */
    send(endpoint) {
        if (this.mode === 'single')
            return this.manager[0].request(endpoint);
        const manager = this.getLeastUsedRequest();
        if (!manager) {
            throw new Error(errorMessage);
        }
        return manager.request(endpoint);
    }
    /**
     * Retrieves data from the Spotify API.
     *
     * @param {string} endpoint - The API endpoint to fetch data from.
     * @returns {Promise<T>} - A promise resolving to the retrieved data.
     */
    getData(endpoint) {
        if (this.mode === 'single')
            return this.manager[0].request(endpoint);
        const manager = this.getLeastUsedRequest();
        if (!manager) {
            throw new Error(errorMessage);
        }
        return manager.getData(endpoint);
    }
    /**
     * Retrieves the least used request manager from the available ones, considering rate limiting.
     *
     * @protected
     * @returns {RestManager | undefined} - The least used request manager, or undefined if all are rate limited.
     */
    getLeastUsedRequest() {
        const manager = this.manager.filter(request => !request.stats.isRateLimited);
        if (!manager.length)
            return undefined;
        return manager.sort((a, b) => a.stats.requests - b.stats.requests)[0];
    }
}
exports.SpotifyManager = SpotifyManager;
