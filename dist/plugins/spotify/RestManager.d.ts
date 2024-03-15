interface RestManagerOptions {
    clientID: string;
    clientSecret: string;
    token?: string;
    authorization?: string;
}
/**
 * Manages RESTful requests to the Spotify API using client credentials for authentication.
 */
export declare class RestManager {
    stats: {
        requests: number;
        isRateLimited: boolean;
        nextRenew: number;
    };
    options: RestManagerOptions;
    /**
     * @param {Omit<RestManagerOptions, 'token' | 'authorization'>} options - The REST manager configuration options.
     */
    constructor(options: Omit<RestManagerOptions, 'token' | 'authorization'>);
    /**
     * Sends a generic request to the Spotify API.
     * @param {string} endpoint - The API endpoint to send the request to.
     * @returns {Promise<T>} - A promise resolving to the response data.
     */
    request<T>(endpoint: string): Promise<T>;
    /**
     * Retrieves data from a provided URL using the Spotify API.
     * @param {string} url - The URL from which to fetch data.
     * @returns {Promise<T>} - A promise resolving to the retrieved data.
     */
    getData<T>(url: string): Promise<T>;
    /**
     * Handles rate limiting by setting a flag and scheduling its reset.
     * @param {number} time - The duration after which the rate limit will be reset.
     */
    private handleRateLimited;
    /**
     * Refreshes the access token for accessing the Spotify API.
     * @returns {Promise<void>} - A promise that resolves when the token is successfully refreshed.
     */
    private refreshToken;
    /**
     * Checks if the access token needs to be renewed and refreshes it if necessary.
     * @returns {Promise<void>} - A promise that resolves when the token is successfully renewed.
     */
    private renew;
}
export {};
