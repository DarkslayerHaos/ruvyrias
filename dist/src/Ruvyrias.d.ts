/// <reference types="node" />
import { Node, NodeStats } from './Node/Node';
import { Player, RuvyriasEvents } from './Player/Player';
import { EventEmitter } from 'events';
import { Response } from './Guild/Response';
import { Plugin } from './Plugin';
import { Track, TrackData } from './Guild/Track';
import { Filters } from './Player/Filters';
import { Deezer } from '../plugins/deezer';
import { Spotify } from '../plugins/spotify';
import { AppleMusic } from '../plugins/applemusic';
/**
 * @extends EventEmitter The main class of Ruvyrias
 */
export type Constructor<T> = new (...args: any[]) => T;
/**
 * Exporting the plugins to the Ruvyrias class.
 */
export { Deezer, Spotify, AppleMusic };
/**
 * Configuration for a group of nodes in Ruvyrias.
 */
export interface NodeGroup {
    /** The name identifier for the node group. */
    name: string;
    /** The host address of the Lavalink node. */
    host: string;
    /** The port number on which the Lavalink node is running. */
    port: number;
    /** The password used for authentication with the Lavalink node. */
    password: string;
    /** Whether to automatically resume playback after a node disconnect. */
    resume?: boolean;
    /** Whether to use a secure connection (HTTPS) with the Lavalink node. */
    secure?: boolean;
    /** An array of region identifiers supported by the node for voice connections. */
    region?: string[];
}
/**
 * Options for resolving a track in Ruvyrias.
 */
export interface ResolveOptions {
    /** The query used to search for a track, e.g., a search term or track URL. */
    query: string;
    /** The source platform for the track resolution, if specified. */
    source?: SupportedPlatforms | (string & {});
    /** The entity making the request for track resolution. */
    requester?: any;
}
/**
 * Supported communication libraries for Ruvyrias.
 */
export type SupportedLibraries = 'discord.js' | 'eris' | 'oceanic' | 'other';
/**
 * Supported platforms for resolving tracks in Ruvyrias.
 */
export type SupportedPlatforms = 'spsearch' | 'dzsearch' | 'amsearch' | 'scsearch' | 'ytsearch' | 'ytmsearch' | 'ymsearch';
/**
 * Options for configuring the Ruvyrias instance.
 */
export interface RuvyriasOptions {
    /** An array of plugins to be used with Ruvyrias. */
    plugins?: Plugin[];
    /** A custom player class constructor. */
    customPlayer?: Constructor<Player>;
    /** A custom filter class constructor. */
    customFilter?: Constructor<Filters>;
    /** Whether to automatically resume playback after a disconnect. */
    autoResume?: boolean;
    /** The library used for communication (e.g., 'discord.js', 'eris', etc.). */
    library: SupportedLibraries;
    /** The default platform for resolving tracks if not specified. */
    defaultPlatform?: SupportedPlatforms;
    /** Timeout duration in milliseconds for automatic resuming of playback. */
    resumeTimeout?: number;
    /** Timeout duration in milliseconds for attempting reconnection to nodes. */
    reconnectTimeout?: number | null;
    /** Number of reconnection attempts allowed before giving up. */
    reconnectTries?: number | null;
    /** Whether to use custom filters for audio processing. */
    useCustomFilters?: boolean;
    /** The name of the client using Ruvyrias. */
    clientName?: string;
    /** The client ID associated with the Ruvyrias instance. */
    clientId?: string | null;
    /** The version number of the client using Ruvyrias. */
    clientVersion?: number;
    /** Indicates whether the Ruvyrias instance is activated or not. */
    isActivated?: boolean;
    /** A function used for sending packets to the communication library. */
    send?: Function | null;
}
/**
 * Options for establishing a voice connection in Ruvyrias.
 */
export interface ConnectionOptions {
    /** The unique identifier of the guild (server) where the connection is established. */
    guildId: string;
    /** The ID of the voice channel to connect to. Can be `null` if disconnecting. */
    voiceChannel: string | null;
    /** The ID of the text channel associated with the voice connection. Can be `null` if not applicable. */
    textChannel: string | null;
    /** Indicates whether the bot should join the voice channel as deafened. */
    deaf?: boolean;
    /** Indicates whether the bot should join the voice channel as muted. */
    mute?: boolean;
    /** The preferred region for the voice connection. */
    region?: string;
}
/**
 * Represents the response structure for retrieving information about a Lavalink node.
 */
export interface NodeInfoResponse {
    /** Information about the Lavalink version. */
    version: {
        semver: string;
        major: number;
        minor: number;
        patch: number;
        /** Optional pre-release version. */
        preRelease?: string;
        /** Optional build version. */
        build?: string;
    };
    /** The build time of the Lavalink node. */
    buildTime: number;
    /** Git-related information. */
    git: {
        /** The Git branch. */
        branch: string;
        /** The Git commit hash. */
        commit: string;
        /** The timestamp of the Git commit. */
        commitTime: string;
    };
    /** Information about the Java Virtual Machine (JVM) used by the Lavalink node. */
    jvm: string;
    /** The version of the Lavaplayer library used by the Lavalink node. */
    lavaplayer: string;
    /** List of source managers supported by the Lavalink node. */
    sourceManagers: string[];
    /** List of available audio filters. */
    filters: string[];
    /** List of installed plugins with their names and versions. */
    plugins: {
        name: string;
        version: string;
    }[];
}
/**
 * Represents a subset of Lavalink node statistics response, excluding frame statistics.
 */
export type NodeStatsResponse = Omit<NodeStats, 'frameStats'>;
/**
 * @extends EventEmitter
 * @interface Ruvyrias
 * @param {RuvyriasOptions} options
 * @param {NodeGroup[]} nodes
 * @param {string} clientId
 * @param {string} clientVersion
 * @param {boolean} isActivated
 * @param {Function} send
 * @param {Map<string, Node>} nodes
 * @param {Map<string, Player>} players
 * @returns Ruvyrias
 */
export declare interface Ruvyrias {
    on<K extends keyof RuvyriasEvents>(event: K, listener: RuvyriasEvents[K]): this;
    once<K extends keyof RuvyriasEvents>(event: K, listener: RuvyriasEvents[K]): this;
    emit<K extends keyof RuvyriasEvents>(event: K, ...args: Parameters<RuvyriasEvents[K]>): boolean;
    off<K extends keyof RuvyriasEvents>(event: K, listener: RuvyriasEvents[K]): this;
}
/**
 * Represents the main Ruvyrias instance, coordinating interactions with nodes and players.
 */
export declare class Ruvyrias extends EventEmitter {
    readonly client: any;
    private readonly _nodes;
    options: RuvyriasOptions;
    nodes: Map<string, Node>;
    players: Map<string, Player>;
    send: Function | null;
    /**
     * This is the main class of Ruvyrias
     * @param {Client | any} client VoiceClient for Ruvyrias library to use to connect to lavalink node server (discord.js, eris, oceanic)
     * @param {NodeGroup[]} nodes Node
     * @param {RuvyriasOptions} options RuvyriasOptions
     * @returns Ruvyrias
     */
    constructor(client: any, nodes: NodeGroup[], options: Omit<RuvyriasOptions, 'clientName' | 'clientId' | 'clientVersion' | 'isActivated' | 'resumeTimeout' | 'useCustomFilters'>);
    /**
     * Initializes the Ruvyrias instance with the specified VoiceClient.
     * @param {any} client - VoiceClient for the Ruvyrias library to use to connect to the Lavalink node server (discord.js, eris, oceanic).
     * @returns {this} - The current Ruvyrias instance.
     */
    init(client: any): this;
    /**
     * Handles Voice State Update and Voice Server Update packets from the Discord API.
     * @param {any} packet Packet from Discord API.
     * @returns {void}
     */
    packetUpdate(packet: any): void;
    /**
     * Adds a node to the Ruvyrias instance.
     * @param {NodeGroup} options - NodeGroup containing node configuration.
     * @returns {Node} - The created Node instance.
     */
    addNode(options: NodeGroup): Node;
    /**
     * Removes a node from the Ruvyrias instance.
     * @param {string} identifier - Node name.
     * @returns {void} void
     */
    removeNode(identifier: string): void;
    /**
     * Retrieves an array of nodes from the Ruvyrias instance based on the specified region.
     * @param {string} region - Region of the node.
     * @returns {Node[]} An array of Node instances.
     */
    getNodeByRegion(region: string): Node[];
    /**
     * Retrieves a node or an array of nodes from the Ruvyrias instance based on the specified identifier.
     * @param {string} identifier - Node name. If set to 'auto', it returns the least used nodes.
     * @returns {Node | Node[]} A Node instance or an array of Node instances.
     */
    getNode(identifier?: string): Node | Node[];
    /**
     * Creates a player connection for the specified guild using the provided options.
     * @param {ConnectionOptions} options - Options for creating the player connection.
     * @returns {Player} The created or existing Player instance for the specified guild.
     */
    createConnection(options: ConnectionOptions): Player;
    /**
     * Creates a player instance for the specified guild using the provided node and options.
     * @param {Node} node - The node to associate with the player.
     * @param {ConnectionOptions} options - Options for creating the player.
     * @returns {Player} The created Player instance.
     */
    private createPlayer;
    /**
     * Removes a player associated with the specified guild from Ruvyrias instance.
     * @param {string} guildId - The ID of the guild for which to remove the player.
     * @returns {Promise<boolean>} A promise that resolves to true if the player is successfully removed; otherwise, false.
     */
    removeConnection(guildId: string): Promise<boolean>;
    /**
     * Gets an array of least used nodes from the Ruvyrias instance.
     * @returns {Node[]} An array of least used nodes.
     */
    get leastUsedNodes(): Node[];
    /**
     * Resolves a track using the specified options and node in Ruvyrias instance.
     * @param {ResolveOptions} options - The options for resolving the track.
     * @param {Node} [node] - The node to use for resolving the track. If not provided, the least used node will be used.
     * @returns {Promise<Response>} A promise that resolves to a Response object containing information about the resolved track.
     */
    resolve({ query, source, requester }: ResolveOptions, node?: Node): Promise<Response>;
    /**
     * Decode a track from Ruvyrias instance.
     * @param {string} track - The encoded track.
     * @param {Node} [node] - The node to decode the track on. If not provided, the least used node will be used.
     * @returns {Promise<TrackData>} A promise that resolves to the decoded track.
     */
    decodeTrack(track: string, node?: Node): Promise<TrackData>;
    /**
     * Decode tracks from Ruvyrias instance.
     * @param {string[]} tracks - The encoded strings.
     * @param {Node} [node] - The node to decode the tracks on. If not provided, the least used node will be used.
     * @returns {Promise<Track[]>} A promise that resolves to an array of decoded tracks.
     */
    decodeTracks(tracks: string[], node?: Node): Promise<Track[]>;
    /**
     * Get lavalink info from Ruvyrias instance
     * @param {string} name The name of the node
     * @returns {NodeInfoResponse} Useful information about the node.
     */
    getLavalinkInfo(name: string): Promise<NodeInfoResponse>;
    /**
     * Get lavalink status from Ruvyrias instance
     * @param {string} name The name of the node
     * @returns {NodeStatsResponse} The stats from the node
     */
    getLavalinkStatus(name: string): Promise<NodeStatsResponse>;
    /**
    * Get the current lavalink version of the node
    * @param {string} name The name of the node
    * @returns {Promise<string>} The version of the node
    */
    getLavalinkVersion(name: string): Promise<string>;
    /**
     * Get a player from Ruvyrias instance.
     * @param {string} guildId - Guild ID.
     * @returns {Player | undefined} The player instance for the specified guild or undefined in case of nothing.
     */
    get(guildId: string): Player | undefined;
}
