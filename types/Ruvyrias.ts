import { TrackStartEvent, TrackEndEvent, TrackStuckEvent, WebSocketClosedEvent, LavalinkPlayer } from './Player';
import { SetStateUpdate, VoiceServer } from './Connection';
import { Plugin } from '../src/Plugin';
import { Player } from '../src/Player';
import { Track } from '../src/Track';
import { NodeStats } from './Node';
import { Node } from '../src/Node';

/**
 * Represents a packet sent over a communication channel, which can be one of several types.
 */
export type Packet = PacketVoiceStateUpdate | PacketVoiceServerUpdate | UnknownPacket;

/**
 * Represents a packet containing an update to the voice state.
 */
export interface PacketVoiceStateUpdate {
    /** The opcode for this packet type. */
    op: number;
    /** The data payload containing the state update. */
    d: SetStateUpdate;
    /** The type identifier for this packet. */
    t: 'VOICE_STATE_UPDATE';
}

/**
 * Represents a packet containing an update to the voice server information.
 */
export interface PacketVoiceServerUpdate {
    /** The opcode for this packet type. */
    op: number;
    /** The data payload containing the voice server information. */
    d: VoiceServer;
    /** The type identifier for this packet. */
    t: 'VOICE_SERVER_UPDATE';
}

/**
 * Represents a packet of any other type not explicitly defined.
 */
export interface UnknownPacket {
    /** The opcode for this packet type. */
    op: number;
    /** The data payload containing arbitrary information. */
    d: any;
    /** The type identifier for this packet. */
    t: string;
}

/**
 * Options for resolving a track in Ruvyrias.
 */
export interface ResolveOptions {
    /** The query used to search for a track, e.g., a search term or track URL. */
    query: string;
    /** The source platform for the track resolution, if specified. */
    source?: PlatformsType | (string & {});
    /** The entity making the request for track resolution. */
    requester?: Object | unknown;
}

/**
 * Supported platforms for resolving tracks in Ruvyrias.
 */
export enum PlatformsType {
    /** Spotify search */
    SpSearch = "spsearch",
    /** Deezer search */
    DzSearch = "dzsearch",
    /** Apple Music search */
    AmSearch = "amsearch",
    /** SoundCloud search */
    ScSearch = "scsearch",
    /** YouTube search */
    YtSearch = "ytsearch",
    /** YouTube Music search */
    YtmSearch = "ytmsearch",
    /** Yandex Music search */
    YmSearch = "ymsearch",
}

/**
 * Supported communication libraries for Ruvyrias.
 */
export enum LibrariesType {
    /** Official Discord.js library for Discord bots. */
    DiscordJS = 'discord.js',
    /** Eris library for Discord bots. */
    Eris = 'eris',
    /** Oceanic.js library for Discord bots. */
    Oceanic = 'oceanic',
    /** Any other custom library. */
    Other = 'other',
}

/**
 * Options for configuring the Ruvyrias instance.
 */
export interface RuvyriasOptions {
    /** An array of plugins to be used with Ruvyrias. */
    plugins?: Plugin[];
    /** Whether to automatically resume playback after a player disconnect. */
    autoResume?: boolean;
    /** Whether to automatically resume playback after a node disconnect. */
    resume?: boolean;
    /** The library used for communication (e.g., 'discord.js', 'eris', etc.). */
    library: LibrariesType;
    /** The default platform for resolving tracks if not specified. */
    defaultPlatform?: PlatformsType;
    /** Timeout duration in milliseconds for automatic resuming of playback. */
    resumeTimeout?: number;
    /** Timeout duration in milliseconds for attempting reconnection to nodes. */
    retryDelay?: number | null;
    /** Number of reconnection attempts allowed before giving up. */
    retryAmount?: number | null;
    /** The client ID associated with the Ruvyrias instance. */
    clientId?: string | null;
    /** Indicates whether the Ruvyrias instance is activated or not. */
    isInitialized?: boolean;
    /** A function used for sending packets to the communication library. */
    sendPayload?: Function | null;
}

/**
 * Options for establishing a voice connection in Ruvyrias.
 */
export interface ConnectionOptions {
    /** The unique identifier of the guild (server) where the connection is established. */
    guildId: string;
    /** The ID of the voice channel to connect to. Can be `null` if disconnecting. */
    voiceChannelId: string | null;
    /** The ID of the text channel associated with the voice connection. Can be `null` if not applicable. */
    textChannelId: string | null;
    /** Indicates whether the bot should join the voice channel as selfDeafened. */
    selfDeaf?: boolean;
    /** Indicates whether the bot should join the voice channel as selfMuted. */
    selfMute?: boolean;
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
    plugins: { name: string; version: string; }[];
}

/**
 * Represents a subset of Lavalink node statistics response, excluding frame statistics.
 */
export type NodeStatsResponse = Omit<NodeStats, 'frameStats'>;

/**
 * All possible events emitted by Ruvyrias.
 */
export enum RuvyriasEvent {
    Debug = 'debug',
    Raw = 'raw',
    NodeConnect = 'nodeConnect',
    NodeDisconnect = 'nodeDisconnect',
    NodeCreate = 'nodeCreate',
    NodeDestroy = 'nodeDestroy',
    NodeReconnect = 'nodeReconnect',
    NodeError = 'nodeError',
    SocketClose = 'socketClose',
    TrackStart = 'trackStart',
    TrackEnd = 'trackEnd',
    TrackError = 'trackError',
    QueueAdd = 'queueAdd',
    QueueRemove = 'queueRemove',
    QueueEnd = 'queueEnd',
    PlayerUpdate = 'playerUpdate',
    PlayerCreate = 'playerCreate',
    PlayerDestroy = 'playerDestroy',
}

/**
 * Represents the events emitted by Ruvyrias.
 */
export interface RuvyriasEvents {
    /**
     * Emitted when data useful for debugging is produced.
     */
    [RuvyriasEvent.Debug]: (...args: any[]) => void;

    /**
     * Emitted when a response is received.
     */
    [RuvyriasEvent.Raw]: (topic: string, ...args: unknown[]) => void;

    /**
     * Emitted when a Lavalink node is connected to Ruvyrias.
     */
    [RuvyriasEvent.NodeConnect]: (node: Node) => void;

    /**
     * Emitted when a Lavalink node is disconnected from Ruvyrias.
     */
    [RuvyriasEvent.NodeDisconnect]: (node: Node, event?: unknown) => void;

    /**
     * Emitted when a Lavalink node is created in Ruvyrias.
     */
    [RuvyriasEvent.NodeCreate]: (node: Node) => void;

    /**
     * Emitted when a Lavalink node is destroyed from Ruvyrias.
     */
    [RuvyriasEvent.NodeDestroy]: (node: Node) => void;

    /**
     * Emitted when Ruvyrias attempts to reconnect with a disconnected Lavalink node.
     */
    [RuvyriasEvent.NodeReconnect]: (node: Node) => void;

    /**
     * Emitted when a Lavalink node encounters an error.
     */
    [RuvyriasEvent.NodeError]: (node: Node, event: any) => void;

    /**
     * Emitted when the websocket connection to Discord voice servers is closed.
     */
    [RuvyriasEvent.SocketClose]: (player: Player, track: Track, data: WebSocketClosedEvent) => void;

    /**
     * Emitted whenever a player starts playing a new track.
     */
    [RuvyriasEvent.TrackStart]: (player: Player, track: Track) => void;

    /**
     * Emitted whenever a track ends.
     */
    [RuvyriasEvent.TrackEnd]: (player: Player, track: Track) => void;

    /**
     * Emitted when a track gets stuck while playing.
     */
    [RuvyriasEvent.TrackError]: (player: Player, data: TrackStuckEvent) => void;

    /**
     * Emitted when a track is added to a player's queue.
     */
    [RuvyriasEvent.QueueAdd]: (player: Player, track: Track) => void;

    /**
     * Emitted when a track is removed from a player's queue.
     */
    [RuvyriasEvent.QueueRemove]: (player: Player, track: Track) => void;

    /**
     * Emitted when a player's queue is completed and going to disconnect.
     */
    [RuvyriasEvent.QueueEnd]: (player: Player) => void;

    /**
     * Emitted when a player is updated.
     */
    [RuvyriasEvent.PlayerUpdate]: (player: LavalinkPlayer) => void;

    /**
     * Emitted when a player is created.
     */
    [RuvyriasEvent.PlayerCreate]: (player: Player) => void;

    /**
     * Emitted when a player is destroyed.
     */
    [RuvyriasEvent.PlayerDestroy]: (player: Player) => void;
}