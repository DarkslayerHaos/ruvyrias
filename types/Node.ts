import { PlayerEventsType } from './Player';
import { RuvyriasOptions } from './Ruvyrias';

/**
 * Configuration for a group of nodes in Ruvyrias.
 */
export interface NodeGroup {
    /** The name identifier for the node group. */
    name?: string;
    /** The host address of the Lavalink node. */
    host: string;
    /** The port number on which the Lavalink node is running. */
    port: number;
    /** The password used for authentication with the Lavalink node. */
    auth: string;
    /** Whether to use a secure connection (HTTPS) with the Lavalink node. */
    secure?: boolean;
    /** An array of region identifiers supported by the node for voice connections. */
    region?: string[] | null;
}

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
 * Dispatched when you successfully connect to the Lavalink node
 */
export interface LavalinkReadyPacket {
    op: 'ready';
    resumed: boolean;
    sessionId: string;
};

/**
 * Dispatched every x seconds with the latest player state
 */
export interface LavalinkPlayerUpdatePacket {
    op: 'playerUpdate';
    guildId: string;
    state: {
        time: number;
        position: number;
        connected: true;
        ping: number;
    };
};

/**
 * Dispatched when the node sends stats once per minute
 */
export interface LavalinkNodeStatsPacket extends NodeStats {
    op: 'stats';
};

/**
 * Dispatched when player or voice events occur
 */
export type LavalinkEventPacket = { op: 'event' } & PlayerEventsType;

/**
 * Represents the various types of packets that can be dispatched by Lavalink.
 */
export type LavalinkPackets = LavalinkReadyPacket | LavalinkPlayerUpdatePacket | LavalinkNodeStatsPacket | LavalinkEventPacket;

/**
 * Represents an combo of additional options to node, directly brought from RuvyriasOptions
 */
export interface Extras extends RuvyriasOptions {
    retryAttempt: NodeJS.Timeout | null;
    currentAttempt: number;
};