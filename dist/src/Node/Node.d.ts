/// <reference types="node" />
import { Ruvyrias, RuvyriasOptions, NodeGroup } from '../Ruvyrias';
import WebSocket from 'ws';
import { Rest } from './Rest';
/**
 * Represents statistics and information about a Lavalink node.
 */
export interface NodeStats {
    players: number;
    playingPlayers: number;
    uptime: number;
    memory: {
        free: number;
        used: number;
        allocated: number;
        reservable: number;
    };
    frameStats: {
        sent: number;
        nulled: number;
        deficit: number;
    };
    cpu: {
        cores: number;
        systemLoad: number;
        lavalinkLoad: number;
    };
}
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
export declare class Node {
    ruvyrias: Ruvyrias;
    readonly name: string;
    readonly password: string;
    readonly secure: boolean;
    readonly regions: Array<string> | null;
    sessionId: string | null;
    readonly socketURL: string;
    readonly restURL: string;
    readonly rest: Rest;
    ws: WebSocket | null;
    readonly autoResume: boolean;
    readonly resumeTimeout: number;
    readonly reconnectTimeout: number;
    readonly reconnectTries: number;
    reconnectAttempt: NodeJS.Timeout | null;
    attempt: number;
    stats: NodeStats | null;
    isConnected: boolean;
    readonly options: NodeGroup;
    /**
     * The Node class that is used to connect to a lavalink node
     * @param ruvyrias Ruvyrias
     * @param node NodeGroup
     * @param options RuvyriasOptions
     */
    constructor(ruvyrias: Ruvyrias, node: NodeGroup, options: RuvyriasOptions);
    /**
     * Establishes a connection to the Lavalink node.
     * @returns {void}
     */
    connect(): void;
    /**
     * Sends a payload to the Lavalink node.
     * @param {any} payload The payload to be sent.
     * @returns {void}
     */
    send(payload: any): void;
    /**
     * Initiates a reconnection attempt to the Lavalink node.
     * @returns {void}
     */
    reconnect(): void;
    /**
     * Disconnects the Lavalink node.
     * @returns {Promise<void>} void
     */
    disconnect(): Promise<void>;
    /**
     * Gets the penalties associated with the current node.
     * @returns {number} The total amount of penalties.
     */
    get penalties(): number;
    /**
     * This function will open up again the node
     * @returns {Promise<void>} The void
     */
    private open;
    /**
     * This function will set the stats accordingly from the NodeStats
     * @param {NodeStats} packet The NodeStats
     * @returns {void} void
     */
    private setStats;
    /**
     * This will send a message to the node
     * @param {any} payload any
     * @returns {Promise<void>} void
     */
    private message;
    /**
     * This will close the connection to the node
     * @param {any} event any
     * @returns {void} void
     */
    private close;
    /**
     * This function will emit the error so that the user's listeners can get them and listen to them
     * @param {any} event any
     * @returns {void} void
     */
    private error;
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
