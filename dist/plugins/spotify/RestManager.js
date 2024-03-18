"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestManager = void 0;
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
/**
 * Manages RESTful requests to the Spotify API using client credentials for authentication.
 */
class RestManager {
    stats = { requests: 0, isRateLimited: false, nextRenew: 0 };
    options;
    /**
     * @param {Omit<RestManagerOptions, 'token' | 'authorization'>} options - The REST manager configuration options.
     */
    constructor(options) {
        this.options = options;
        this.options.authorization = `Basic ${Buffer.from(`${options.clientID}:${options.clientSecret}`).toString('base64')}`;
        this.refreshToken();
    }
    /**
     * Sends a generic request to the Spotify API.
     * @param {string} endpoint - The API endpoint to send the request to.
     * @returns {Promise<T>} - A promise resolving to the response data.
     */
    async request(endpoint) {
        await this.renew();
        const req = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
            headers: { 'Authorization': this.options.token },
        });
        const data = (await req.json());
        if (req.headers.get('x-ratelimit-remaining') === '0') {
            this.handleRateLimited(Number(req.headers.get('x-ratelimit-reset')) * 1000);
            throw new Error('[Ruvyrias Spotify] currently we got rate limited by spotify!');
        }
        this.stats.requests++;
        return data;
    }
    /**
     * Retrieves data from a provided URL using the Spotify API.
     * @param {string} url - The URL from which to fetch data.
     * @returns {Promise<T>} - A promise resolving to the retrieved data.
     */
    async getData(url) {
        await this.renew();
        const req = await fetch(url, {
            headers: { 'Authorization': this.options.token },
        });
        const data = (await req.json());
        if (req.headers.get('x-ratelimit-remaining') === '0') {
            this.handleRateLimited(Number(req.headers.get('x-ratelimit-reset')) * 1000);
            throw new Error('[Ruvyrias Spotify] currently we got rate limited by spotify!');
        }
        this.stats.requests++;
        return data;
    }
    /**
     * Handles rate limiting by setting a flag and scheduling its reset.
     * @param {number} time - The duration after which the rate limit will be reset.
     */
    handleRateLimited(time) {
        this.stats.isRateLimited = true;
        setTimeout(() => {
            this.stats.isRateLimited = false;
        }, time);
    }
    /**
     * Refreshes the access token for accessing the Spotify API.
     * @returns {Promise<void>} - A promise that resolves when the token is successfully refreshed.
     */
    async refreshToken() {
        try {
            const req = await fetch('https://accounts.spotify.com/api/token?grant_type=client_credentials', {
                method: 'POST',
                headers: {
                    Authorization: `${this.options.authorization}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const { access_token, expires_in } = (await req.json());
            if (!access_token) {
                throw new Error('[Ruvyrias Spotify] failed to fetch access token from spotify api');
            }
            this.options.token = `Bearer ${access_token}`;
            this.stats.nextRenew = new Date().getTime() + expires_in * 1000;
        }
        catch (e) {
            if (e.status === 400) {
                throw new Error('Spotify Plugin has been rate limited');
            }
        }
    }
    /**
     * Checks if the access token needs to be renewed and refreshes it if necessary.
     * @returns {Promise<void>} - A promise that resolves when the token is successfully renewed.
     */
    async renew() {
        if (Date.now() >= this.stats.nextRenew) {
            await this.refreshToken();
        }
    }
}
exports.RestManager = RestManager;
