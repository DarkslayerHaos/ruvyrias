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
 * Represents a connection to a Lavalink node, allowing communication and control over audio playback.
 */
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
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    /**
     * Sends a payload to the Lavalink node.
     * @param {any} payload The payload to be sent.
     * @returns {void}
     */
    send(payload: any): void;
    /**
     * Initiates a reconnection attempt to the Lavalink node.
     * @returns {Promise<void>}
     */
    reconnect(): Promise<void>;
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
     * This will send a message to the node
     * @param {string} payload The sent payload we recieved in stringified form
     * @returns {Promise<void>} Return void
     */
    private message;
    /**
     * This will close the connection to the node
     * @param {any} event any
     * @returns {Promise<void>} void
     */
    private close;
    /**
     * This function will emit the error so that the user's listeners can get them and listen to them
     * @param {any} event any
     * @returns {void} void
     */
    private error;
}
