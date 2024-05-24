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
 * Represents an combo of additional options to node, directly brought from RuvyriasOptions
 */
interface Extras extends RuvyriasOptions {
    reconnectAttempt: NodeJS.Timeout | null;
    currentAttempt: number;
    isConnected: boolean;
}
/**
 * Represents a connection to a Lavalink node, allowing communication and control over audio playback.
 */
export declare class Node {
    ruvyrias: Ruvyrias;
    ws: WebSocket | null;
    readonly restURL: string;
    readonly socketURL: string;
    readonly rest: Rest;
    stats: NodeStats;
    readonly options: NodeGroup;
    readonly extras: Omit<Extras, 'library'>;
    /**
     * The Node class that is used to connect to a lavalink node
     * @param {Ruvyrias} ruvyrias
     * @param {NodeGroup} node
     * @param {RuvyriasOptions} options
     */
    constructor(ruvyrias: Ruvyrias, node: NodeGroup, options: RuvyriasOptions);
    /**
     * Establishes a connection to the Lavalink node.
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
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
      * Sends a payload to the Lavalink node.
      * @param {any} payload The payload to be sent.
      * @returns {void}
      */
    send(payload: any): void;
    /**
     * Returns the name of the node.
     * @returns {string} The name of the node.
     */
    get name(): string;
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
export {};
