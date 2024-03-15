const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

interface RestManagerOptions {
    clientID: string;
    clientSecret: string
    token?: string
    authorization?: string;
}

/**
 * Manages RESTful requests to the Spotify API using client credentials for authentication.
 */
export class RestManager {
    public stats: { requests: number; isRateLimited: boolean, nextRenew: number } = { requests: 0, isRateLimited: false, nextRenew: 0 };
    public options: RestManagerOptions;

    /**
     * @param {Omit<RestManagerOptions, 'token' | 'authorization'>} options - The REST manager configuration options.
     */
    public constructor(options: Omit<RestManagerOptions, 'token' | 'authorization'>) {
        this.options = options
        this.options.authorization = `Basic ${Buffer.from(`${options.clientID}:${options.clientSecret}`).toString('base64',)}`;
        this.refreshToken();
    }

    /**
     * Sends a generic request to the Spotify API.
     * @param {string} endpoint - The API endpoint to send the request to.
     * @returns {Promise<T>} - A promise resolving to the response data.
     */
    public async request<T>(endpoint: string): Promise<T> {
        await this.renew();

        const req = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
            headers: { Authorization: this.options.token },
        })

        const data = (await req.json()) as Promise<T>;

        if (req.headers.get('x-ratelimit-remaining') === '0') {
            this.handleRateLimited(Number(req.headers.get('x-ratelimit-reset')) * 1000);
            throw new Error('[Ruvyrias Spotify] currently we got rate limited by spotify!')
        }
        this.stats.requests++;

        return data;
    }

    /**
     * Retrieves data from a provided URL using the Spotify API.
     * @param {string} url - The URL from which to fetch data.
     * @returns {Promise<T>} - A promise resolving to the retrieved data.
     */
    public async getData<T>(url: string): Promise<T> {
        await this.renew();
        const req = await fetch(url,
            {
                headers: { Authorization: this.options.token },
            })
        const data = (await req.json()) as Promise<T>;

        if (req.headers.get('x-ratelimit-remaining') === '0') {
            this.handleRateLimited(Number(req.headers.get('x-ratelimit-reset')) * 1000);
            throw new Error('[Ruvyrias Spotify] currently we got rate limited by spotify!')
        }
        this.stats.requests++;

        return data;
    }

    /**
     * Handles rate limiting by setting a flag and scheduling its reset.
     * @param {number} time - The duration after which the rate limit will be reset.
     */
    private handleRateLimited(time: number): void {
        this.stats.isRateLimited = true;
        setTimeout(() => {
            this.stats.isRateLimited = false;
        }, time);
    }

    /**
     * Refreshes the access token for accessing the Spotify API.
     * @returns {Promise<void>} - A promise that resolves when the token is successfully refreshed.
     */
    private async refreshToken(): Promise<void> {
        try {
            const req = await fetch(
                'https://accounts.spotify.com/api/token?grant_type=client_credentials',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `${this.options.authorization}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { access_token, expires_in } = (await req.json()) as {
                access_token?: string;
                expires_in: number;
            };
            if (!access_token) {
                throw new Error('[Ruvyrias Spotify] failed to fetch access token from spotify api');
            }
            this.options.token = `Bearer ${access_token}`;
            this.stats.nextRenew = new Date().getTime() + expires_in * 1000;
        } catch (e: any) {
            if (e.status === 400) {
                throw new Error('Spotify Plugin has been rate limited');
            }
        }
    }

    /**
     * Checks if the access token needs to be renewed and refreshes it if necessary.
     * @returns {Promise<void>} - A promise that resolves when the token is successfully renewed.
     */
    private async renew(): Promise<void> {
        if (Date.now() >= this.stats.nextRenew) {
            await this.refreshToken();
        }
    }
}