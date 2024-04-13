import { Node, NodeStats } from './Node/Node';
import { Player, TrackEndEvent, TrackStartEvent, TrackStuckEvent, WebSocketClosedEvent } from './Player/Player';
import { EventEmitter } from 'events';
import { Config } from './Config';
import { LoadTrackResponse, Response } from './Guild/Response';
import { Plugin } from './Plugin';
import { Track, TrackData } from './Guild/Track';
import { Deezer } from '../plugins/deezer';
import { Spotify } from '../plugins/spotify';
import { AppleMusic } from '../plugins/applemusic';
import { IVoiceServer, SetStateUpdate } from './Player/Connection';

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
 * Represents a packet sent over a communication channel, which can be one of several types.
 */
export type Packet = PacketVoiceStateUpdate | PacketVoiceServerUpdate | AnyOtherPacket;

/**
 * Represents a packet containing an update to the voice state.
 */
export interface PacketVoiceStateUpdate {
    /** The opcode for this packet type. */
    op: number;
    /** The data payload containing the state update. */
    d: SetStateUpdate;
    /** The type identifier for this packet. */
    t: "VOICE_STATE_UPDATE";
}

/**
 * Represents a packet containing an update to the voice server information.
 */
export interface PacketVoiceServerUpdate {
    /** The opcode for this packet type. */
    op: number;
    /** The data payload containing the voice server information. */
    d: IVoiceServer;
    /** The type identifier for this packet. */
    t: "VOICE_SERVER_UPDATE";
}

/**
 * Represents a packet of any other type not explicitly defined.
 */
export interface AnyOtherPacket {
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
    plugins: { name: string; version: string; }[];
}

/**
 * Represents a subset of Lavalink node statistics response, excluding frame statistics.
 */
export type NodeStatsResponse = Omit<NodeStats, 'frameStats'>;

/**
 * Represents the events emitted by Ruvyrias.
 */
export interface RuvyriasEvents {
    /**
     * Emitted when data useful for debugging is produced.
     * @param {...any} args - The arguments emitted with the event.
     */
    debug: (...args: any[]) => void;

    /**
     * Emitted when a response is received.
     * @param {string} topic - The section from which the event originates.
     * @param {...unknown} args - The arguments emitted with the event.
     */
    raw: (topic: string, ...args: unknown[]) => void;

    /**
     * Emitted when a Lavalink node is connected to Ruvyrias.
     * @param {Node} node - The connected Lavalink node.
     */
    nodeConnect: (node: Node) => void;

    /**
     * Emitted when a Lavalink node is disconnected from Ruvyrias.
     * @param {Node} node - The disconnected Lavalink node.
     * @param {unknown} [event] - Additional event data.
     */
    nodeDisconnect: (node: Node, event?: unknown) => void;

    /**
     * Emitted when Ruvyrias attempts to reconnect with a disconnected Lavalink node.
     * @param {Node} node - The Lavalink node being reconnected to.
     */
    nodeReconnect: (node: Node) => void;

    /**
     * Emitted when a Lavalink node encounters an error.
     * @param {Node} node - The Lavalink node that encountered the error.
     * @param {any} event - The error event.
     */
    nodeError: (node: Node, event: any) => void;

    /**
     * Emitted whenever a player starts playing a new track.
     * @param {Player} player - The player instance.
     * @param {Track} track - The track being played.
     * @param {TrackStartEvent} data - Additional data related to the track start event.
     */
    trackStart: (player: Player, track: Track, data: TrackStartEvent) => void;

    /**
     * Emitted whenever a track ends.
     * @param {Player} player - The player instance.
     * @param {Track} track - The track that ended.
     * @param {TrackEndEvent} data - Additional data related to the track end event.
     */
    trackEnd: (player: Player, track: Track, data: TrackEndEvent) => void;

    /**
     * Emitted when a player's queue is completed and going to disconnect.
     * @param {Player} player - The player instance.
     */
    queueEnd: (player: Player) => void;

    /**
     * Emitted when a track gets stuck while playing.
     * @param {Player} player - The player instance.
     * @param {Track} track - The track that got stuck.
     * @param {TrackStuckEvent} data - Additional data related to the track stuck event.
     */
    trackError: (player: Player, track: Track, data: TrackStuckEvent) => void;

    /**
     * Emitted when a player is updated.
     * @param {Player} player - The player instance.
     */
    playerUpdate: (player: Player) => void;

    /**
     * Emitted when a player is created.
     * @param {Player} player - The player instance.
     */
    playerCreate: (player: Player) => void;

    /**
     * Emitted when a player is destroyed.
     * @param {Player} player - The player instance.
     */
    playerDestroy: (player: Player) => void;

    /**
     * Emitted when the websocket connection to Discord voice servers is closed.
     * @param {Player} player - The player instance.
     * @param {Track} track - The track being played.
     * @param {WebSocketClosedEvent} data - Additional data related to the socket close event.
     */
    socketClose: (player: Player, track: Track, data: WebSocketClosedEvent) => void;
}

/**
 * Represents the Ruvyrias instance.
 * This interface defines methods for event handling.
 */
export interface Ruvyrias {
    /**
     * Adds a listener function to the specified event.
     * @param {K} event - The event name.
     * @param {RuvyriasEvents[K]} listener - The listener function to be called when the event is emitted.
     * @returns {this} - The Ruvyrias instance.
     */
    on<K extends keyof RuvyriasEvents>(event: K, listener: RuvyriasEvents[K]): this;

    /**
     * Adds a one-time listener function to the specified event.
     * The listener will be removed after it is invoked once.
     * @param {K} event - The event name.
     * @param {RuvyriasEvents[K]} listener - The listener function to be called when the event is emitted.
     * @returns {this} - The Ruvyrias instance.
     */
    once<K extends keyof RuvyriasEvents>(event: K, listener: RuvyriasEvents[K]): this;

    /**
     * Emits the specified event with the provided arguments.
     * @param {K} event - The event name to emit.
     * @param {...Parameters<RuvyriasEvents[K]>} args - The arguments to pass to the event listeners.
     * @returns {boolean} - Returns true if event had listeners, false otherwise.
     */
    emit<K extends keyof RuvyriasEvents>(event: K, ...args: Parameters<RuvyriasEvents[K]>): boolean;

    /**
     * Removes the specified listener from the event.
     * @param {K} event - The event name.
     * @param {RuvyriasEvents[K]} listener - The listener function to remove.
     * @returns {this} - The Ruvyrias instance.
     */
    off<K extends keyof RuvyriasEvents>(event: K, listener: RuvyriasEvents[K]): this;
}

/**
 * Represents the main Ruvyrias instance, coordinating interactions with nodes and players.
 */
export class Ruvyrias extends EventEmitter {
    public readonly client: any;
    private readonly _nodes: NodeGroup[];
    public options: RuvyriasOptions;
    public nodes: Map<string, Node>;
    public players: Map<string, Player>;
    public send: Function | null;

    /**
     * This is the main class of Ruvyrias
     * @param {Client | any} client VoiceClient for Ruvyrias library to use to connect to lavalink node server (discord.js, eris, oceanic)
     * @param {NodeGroup[]} nodes Node
     * @param {RuvyriasOptions} options RuvyriasOptions
     * @returns Ruvyrias
     */
    constructor(client: any, nodes: NodeGroup[], options: Omit<RuvyriasOptions,
        'clientName'
        | 'clientId'
        | 'clientVersion'
        | 'isActivated'
        | 'resumeTimeout'>
    ) {
        super();
        this.client = client;
        this._nodes = nodes;
        this.nodes = new Map();
        this.players = new Map();
        this.options = {
            clientName: Config.clientName as string,
            clientVersion: Config.clientVersion as number,
            clientId: null,
            isActivated: false,
            ...options
        };
        this.send = null;
    }

    /**
     * Initializes the Ruvyrias instance with the specified VoiceClient.
     * @param {any} client - VoiceClient for the Ruvyrias library to use to connect to the Lavalink node server (discord.js, eris, oceanic).
     * @returns {Promise<this>} - The current Ruvyrias instance.
     */
    public async init(client: any): Promise<this> {
        if (this.options.isActivated) return this;
        this.options.clientId = client.user?.id as string;
        this._nodes.forEach(async (node) => await this.addNode(node));
        this.options.isActivated = true;

        if (this.options.plugins) {
            this.options.plugins.forEach((plugin) => {
                plugin.load(this);
            });
        }

        if (!this.options.library) this.options.library = 'discord.js';

        switch (this.options.library) {
            case 'discord.js': {
                this.send = (packet: Packet) => {
                    const guild = client.guilds.cache.get(packet.d.guild_id);
                    if (guild) guild.shard?.send(packet);
                };

                client.on('raw', async (packet: Packet) => { await this.packetUpdate(packet); });
                break;
            }
            case 'eris': {
                this.send = (packet: Packet) => {
                    const guild = client.guilds.get(packet.d.guild_id);
                    if (guild) guild.shard.sendWS(packet?.op, packet?.d);
                };

                client.on('rawWS', async (packet: Packet) => { await this.packetUpdate(packet); });
                break;
            }
            case 'oceanic': {
                this.send = (packet: Packet) => {
                    const guild = client.guilds.get(packet.d.guild_id);
                    if (guild) guild.shard.send(packet?.op, packet?.d);
                };

                client.on('packet', async (packet: Packet) => { await this.packetUpdate(packet); });
                break;
            }
            case 'other': {
                if (!this.send) {
                    throw new Error('Send function is required in Ruvyrias Options');
                }

                this.send = this.options.send ?? null;
                break;
            }
        }

        return this;
    }

    /**
     * Handles Voice State Update and Voice Server Update packets from the Discord API.
     * @param {Packet} packet Packet from Discord API.
     * @returns {Promise<void>} 
     */
    public async packetUpdate(packet: Packet): Promise<void> {
        if (!['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(packet.t)) return;
        const player = this.players.get(packet.d.guild_id);
        if (!player) return;

        if (packet.t === 'VOICE_SERVER_UPDATE') {
            await player.connection.setServersUpdate(packet.d);
        }
        if (packet.t === 'VOICE_STATE_UPDATE') {
            if (packet.d.user_id !== this.options.clientId) return;
            await player.connection.setStateUpdate(packet.d);
        }
    }

    /**
     * Adds a node to the Ruvyrias instance.
     * @param {NodeGroup} options - NodeGroup containing node configuration.
     * @returns {Promise<Node>} - The created Node instance.
     */
    public async addNode(options: NodeGroup): Promise<Node> {
        const node = new Node(this, options, this.options);
        this.nodes.set(options.name, node);
        await node.connect();
        return node;
    }

    /**
     * Removes a node from the Ruvyrias instance.
     * @param {string} identifier - Node name.
     * @returns {Promise<boolean>} Whether the node was successfully removed.
     */
    public async removeNode(identifier: string): Promise<boolean> {
        const node = this.nodes.get(identifier);
        if (!node) {
            throw new Error('The node identifier you specified doesn\'t exist');
        }

        await node.disconnect();
        this.nodes.delete(identifier);
        return true;
    }

    /**
     * Retrieves an array of nodes from the Ruvyrias instance based on the specified region.
     * @param {string} region - Region of the node.
     * @returns {Node[]} An array of Node instances.
     */
    public getNodeByRegion(region: string): Node[] {
        return [...this.nodes.values()]
            .filter(
                (node) =>
                    node.isConnected && node.regions?.includes(region?.toLowerCase())
            )
            .sort((a, b) => {
                const aLoad = a.stats?.cpu
                    ? (a.stats.cpu.systemLoad / a.stats.cpu.cores) * 100
                    : 0;
                const bLoad = b.stats?.cpu
                    ? (b.stats.cpu.systemLoad / b.stats.cpu.cores) * 100
                    : 0;
                return aLoad - bLoad;
            });
    }

    /**
     * Retrieves a node or an array of nodes from the Ruvyrias instance based on the specified identifier.
     * @param {string} identifier - Node name. If set to 'auto', it returns the least used nodes.
     * @returns {Node | Node[]} A Node instance or an array of Node instances.
     */
    public async getNode(identifier: string = 'auto'): Promise<Node | Node[]> {
        if (!this.nodes.size) {
            throw new Error('[Ruvyrias Error] No nodes available currently');
        }

        if (identifier === 'auto') return this.leastUsedNodes;

        const node = this.nodes.get(identifier);
        if (!node) {
            throw new Error('[Ruvyrias Error] The node identifier you specified doesn\'t exist');
        }

        if (!node.isConnected) await node.connect();
        return node;
    }

    /**
     * Creates a player connection for the specified guild using the provided options.
     * @param {ConnectionOptions} options - Options for creating the player connection.
     * @returns {Player} The created or existing Player instance for the specified guild.
     */
    public createConnection(options: ConnectionOptions): Player {
        if (!this.options.isActivated) {
            throw new Error('[Ruvyrias Error] Ruvyrias must be initialized in your ready event.');
        }

        const player = this.players.get(options.guildId);
        if (player) return player;

        if (this.leastUsedNodes.length === 0) {
            throw new Error('[Ruvyrias Error] No nodes are available.');
        }

        let node: Node;

        if (options.region) {
            const regionNode = this.getNodeByRegion(options.region)[0];
            node = this.nodes.get(regionNode.name ?? this.leastUsedNodes[0]?.name) as Node;
        } else {
            node = this.nodes.get(this.leastUsedNodes[0]?.name) as Node;
        }

        if (!node) {
            throw new Error('[Ruvyrias Error] No nodes are available.');
        }

        return this.createPlayer(node, options);
    }

    /**
     * Creates a player instance for the specified guild using the provided node and options.
     * @param {Node} node - The node to associate with the player.
     * @param {ConnectionOptions} options - Options for creating the player.
     * @returns {Player} The created Player instance.
     */
    private createPlayer(node: Node, options: ConnectionOptions): Player {
        const player = new Player(this, node, options);

        this.players.set(options.guildId, player);
        player.connect(options);
        this.emit('playerCreate', player);
        this.emit('debug', options.guildId, '[Ruvyrias Player] Created a new player.');

        return player;
    }

    /**
     * Destroys the player instance for the specified guild using the provided guild ID.
     * @param {string} guildId - The ID of the guild associated with the player instance.
     * @returns {boolean|null} A Promise that resolves with a boolean indicating success or null if no specific value is needed.
     */
    public destroyPlayer(guildId: string): boolean | null {
        const player = this.players.get(guildId);
        if (!player) return null;

        this.emit('playerDestroy', player);
        this.emit('debug', guildId, '[Ruvyrias Player] Destroyed the player.');
        this.players.delete(guildId);

        return true;
    }

    /**
     * Removes a player associated with the specified guild from Ruvyrias instance.
     * @param {string} guildId - The ID of the guild for which to remove the player.
     * @returns {Promise<boolean>} A promise that resolves to true if the player is successfully removed; otherwise, false.
     */
    public async removeConnection(guildId: string): Promise<boolean> {
        this.players.delete(guildId);
        return await this.players.get(guildId)?.stop() ?? false;
    }

    /**
     * Gets an array of least used nodes from the Ruvyrias instance.
     * @returns {Node[]} An array of least used nodes.
     */
    public get leastUsedNodes(): Node[] {
        return [...this.nodes.values()]
            .filter((node) => node.isConnected)
            .sort((a, b) => a.penalties - b.penalties);
    }

    /**
     * Resolves a track using the specified options and node in Ruvyrias instance.
     * @param {ResolveOptions} options - The options for resolving the track.
     * @param {Node} [node] - The node to use for resolving the track. If not provided, the least used node will be used.
     * @returns {Promise<Response>} A promise that resolves to a Response object containing information about the resolved track.
     */
    public async resolve({ query, source, requester }: ResolveOptions, node?: Node): Promise<Response> {
        if (!this.options.isActivated) {
            throw new Error('[Ruvyrias Error] Ruvyrias must be initialized in your ready event.');
        }

        if (this.leastUsedNodes.length === 0) {
            throw new Error('[Ruvyrias Error] No nodes are available.');
        }

        node = node ?? this.leastUsedNodes[0];

        const trackIdentifier = /^https?:\/\//.test(query) ? query : `${source ?? 'ytsearch'}:${query}`;
        const response = await node.rest.get(`/v4/loadtracks?identifier=${encodeURIComponent(trackIdentifier)}`) as LoadTrackResponse;
        return new Response(response, requester);
    }

    /**
     * Decode a track from Ruvyrias instance.
     * @param {string} track - The encoded track.
     * @param {Node} [node] - The node to decode the track on. If not provided, the least used node will be used.
     * @returns {Promise<TrackData>} A promise that resolves to the decoded track.
     */
    public async decodeTrack(track: string, node?: Node): Promise<TrackData> {
        if (!node) node = this.leastUsedNodes[0];

        return await node.rest.get(`/v4/decodetrack?encodedTrack=${encodeURIComponent(track)}`) as TrackData;
    }

    /**
     * Decode tracks from Ruvyrias instance.
     * @param {string[]} tracks - The encoded strings.
     * @param {Node} [node] - The node to decode the tracks on. If not provided, the least used node will be used.
     * @returns {Promise<Track[]>} A promise that resolves to an array of decoded tracks.
     */
    public async decodeTracks(tracks: string[], node?: Node): Promise<Track[]> {
        if (!node) node = this.leastUsedNodes[0];

        return await node.rest.post(`/v4/decodetracks`, tracks) as Track[];
    }

    /**
     * Get lavalink info from Ruvyrias instance
     * @param {string} name The name of the node
     * @returns {NodeInfoResponse} Useful information about the node.
     */
    public async getLavalinkInfo(name: string): Promise<NodeInfoResponse> {
        const node = this.nodes.get(name);
        if (!node) {
            throw new Error('[Ruvyrias Error] Node not found!');
        }

        return await node.rest.get(`/v4/info`) as NodeInfoResponse;
    }

    /**
     * Get lavalink status from Ruvyrias instance
     * @param {string} name The name of the node
     * @returns {NodeStatsResponse} The stats from the node
     */
    public async getLavalinkStatus(name: string): Promise<NodeStatsResponse> {
        const node = this.nodes.get(name);
        if (!node) {
            throw new Error('[Ruvyrias Error] Node not found!');
        }

        return await node.rest.get(`/v4/stats`) as NodeStatsResponse;
    }

    /**
    * Get the current lavalink version of the node
    * @param {string} name The name of the node
    * @returns {Promise<string>} The version of the node
    */
    public async getLavalinkVersion(name: string): Promise<string> {
        const node = this.nodes.get(name)
        if (!node) {
            throw new Error('[Ruvyrias Error] Node not found!');
        }

        return await node.rest.get(`/version`) as string;
    }

    /**
     * Get a player from Ruvyrias instance.
     * @param {string} guildId - Guild ID.
     * @returns {Player | null} The player instance for the specified guild or undefined in case of nothing.
     */
    public get(guildId: string): Player | null {
        return this.players.get(guildId) ?? null;
    }
}