import { RestManager } from './RestManager';
import { SpotifyOptions } from './Spotify';
/**
 * Manages interactions with the Spotify API, handling single or multiple client configurations.
 */
export declare class SpotifyManager {
    private readonly mode;
    private manager;
    /**
     * @param {SpotifyOptions} data - The Spotify client configuration data.
     */
    constructor(data: SpotifyOptions);
    /**
     * Sends a generic request to the Spotify API.
     *
     * @param {string} endpoint - The API endpoint to send the request to.
     * @returns {Promise<T>} - A promise resolving to the response data.
     */
    send<T>(endpoint: string): Promise<T>;
    /**
     * Retrieves data from the Spotify API.
     *
     * @param {string} endpoint - The API endpoint to fetch data from.
     * @returns {Promise<T>} - A promise resolving to the retrieved data.
     */
    getData<T>(endpoint: string): Promise<T>;
    /**
     * Retrieves the least used request manager from the available ones, considering rate limiting.
     *
     * @protected
     * @returns {RestManager | undefined} - The least used request manager, or undefined if all are rate limited.
     */
    protected getLeastUsedRequest(): RestManager | undefined;
}
