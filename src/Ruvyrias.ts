import { LoadTrackResponse } from '../types';
import { Response } from './Response';
import { EventEmitter } from 'events';
import { TrackData } from '../types';
import { NodeGroup } from '../types';
import { version } from '../index';
import { Player } from './Player';
import { Track } from './Track';
import { Node } from './Node';
import {
    RuvyriasOptions,
    Packet,
    NodeInfoResponse,
    NodeStatsResponse,
    ConnectionOptions,
    ResolveOptions,
    RuvyriasEvents,
    RuvyriasEvent,
    LibrariesType
} from '../types/Ruvyrias';

/**
 * Represents the Ruvyrias instance.
 * This interface defines methods for event handling.
 */
export interface Ruvyrias {
    on<K extends keyof RuvyriasEvents>(event: K, listener: RuvyriasEvents[K]): this;
    once<K extends keyof RuvyriasEvents>(event: K, listener: RuvyriasEvents[K]): this;
    emit<K extends keyof RuvyriasEvents>(event: K, ...args: Parameters<RuvyriasEvents[K]>): boolean;
    off<K extends keyof RuvyriasEvents>(event: K, listener: RuvyriasEvents[K]): this;
}

/**
 * Represents the main Ruvyrias instance, coordinating interactions with nodes and players.
 */
export class Ruvyrias extends EventEmitter {
    public readonly client: any;
    private readonly nodesMap: NodeGroup[];
    public readonly options: RuvyriasOptions;
    public readonly nodes: Map<string, Node>;
    public readonly players: Map<string, Player>;
    public send: Function | null;

    /**
     * Constructs the main Ruvyrias instance, initializing nodes and event handling.
     *
     * @param {any} client - The voice client used to connect to Lavalink (discord.js, eris, oceanic).
     * @param {NodeGroup[]} nodes - Array of nodes to manage.
     * @param {Omit<RuvyriasOptions, 'clientId' | 'isInitialized' | 'resumeTimeout'>} options - Configuration options.
     */
    constructor(client: any, nodes: NodeGroup[], options: Omit<RuvyriasOptions, 'clientId' | 'isInitialized' | 'resumeTimeout'>) {
        super();
        this.client = client;
        this.nodesMap = nodes;
        this.nodes = new Map();
        this.players = new Map();
        this.options = {
            clientId: null,
            isInitialized: false,
            ...options
        };
        this.send = null;
    }

    /**
     * Initializes the Ruvyrias instance with the provided voice client,
     * connecting nodes and setting up event listeners.
     *
     * @param {any} client - The voice client used to connect to Lavalink.
     * @returns {Promise<this>} The initialized Ruvyrias instance.
     */
    public async init(client: any): Promise<this> {
        if (this.options.isInitialized) return this;
        this.options.isInitialized = true;
        this.options.clientId = client.user?.id as string;
        this.nodesMap.forEach(async (node) => await this.addNode(node));

        this.emit(RuvyriasEvent.Debug, `Ruvyrias -> Initialized with clientId "${this.options.clientId}", ready to go!`);
        this.emit(RuvyriasEvent.Debug, `Ruvyrias -> Version: ${version}.`);
        this.emit(RuvyriasEvent.Debug, `Ruvyrias -> Connected nodes: ${this.nodesMap.length}.`);

        if (this.options.plugins) {
            this.emit(RuvyriasEvent.Debug, `Ruvyrias -> Plugins loaded: ${this.options.plugins.length}.`);

            this.options.plugins.forEach((plugin) => {
                plugin.load(this);
            });
        }

        if (!this.options.library) this.options.library = LibrariesType.DiscordJS;

        switch (this.options.library) {
            case 'discord.js': {
                this.send = (packet: Packet) => {
                    const guild = client.guilds.cache.get(packet.d.guild_id);
                    if (guild) guild.shard?.send(packet);
                };

                client.on('raw', async (packet: Packet) => { await this.handleVoicePacket(packet); });
                break;
            }
            case 'eris': {
                this.send = (packet: Packet) => {
                    const guild = client.guilds.get(packet.d.guild_id);
                    if (guild) guild.shard.sendWS(packet?.op, packet?.d);
                };

                client.on('rawWS', async (packet: Packet) => { await this.handleVoicePacket(packet); });
                break;
            }
            case 'oceanic': {
                this.send = (packet: Packet) => {
                    const guild = client.guilds.get(packet.d.guild_id);
                    if (guild) guild.shard.send(packet?.op, packet?.d);
                };

                client.on('packet', async (packet: Packet) => { await this.handleVoicePacket(packet); });
                break;
            }
            case 'other': {
                if (!this.send) {
                    throw new Error('Send function is required in Ruvyrias Options');
                }

                this.send = this.options.sendPayload ?? null;
                break;
            }
        }

        return this;
    }

    /**
     * Handles voice-related packets from the client and updates the corresponding player connection.
     *
     * @param {Packet} packet - A packet received from the voice server.
     * @returns {Promise<void>}
     */
    public async handleVoicePacket(packet: Packet): Promise<void> {
        if (!['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(packet.t)) return;
        const player = this.players.get(packet.d.guild_id);
        if (!player) return;

        if (packet.t === 'VOICE_SERVER_UPDATE') {
            await player.connection.updateVoiceServer(packet.d);
        }
        if (packet.t === 'VOICE_STATE_UPDATE') {
            if (packet.d.user_id !== this.options.clientId) return;
            await player.connection.updateVoiceState(packet.d);
        }
    }

    /**
     * Adds a new node to the Ruvyrias instance and connects it.
     *
     * @param {NodeGroup} options - Node configuration options.
     * @returns {Promise<Node>} The created Node instance.
     */
    public async addNode(options: NodeGroup): Promise<Node> {
        const node = new Node(this, options, this.options);
        this.nodes.set(options.name as string, node);
        await node.connect();

        this.emit(RuvyriasEvent.NodeCreate, node);
        return node;
    }

    /**
     * Removes a node from the Ruvyrias instance and disconnects it.
     *
     * @param {string} identifier - Name of the node to remove.
     * @returns {Promise<boolean>} True if the node was successfully removed.
     */
    public async removeNode(identifier: string): Promise<boolean> {
        const node = this.nodes.get(identifier);
        if (!node) {
            throw new Error('The node identifier you specified doesn\'t exist');
        }

        await node.disconnect();
        this.nodes.delete(identifier);

        this.emit(RuvyriasEvent.NodeDestroy, node);
        return true;
    }

    /**
     * Retrieves nodes that match a specific region, sorted by system load.
     *
     * @param {string} region - The region to filter nodes.
     * @returns {Node[]} An array of nodes in the specified region.
     */
    public getNodesByRegion(region: string): Node[] {
        return [...this.nodes.values()]
            .filter(
                (node) =>
                    node.isConnected && node.options.region?.includes(region?.toLowerCase())
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
     * Retrieves a node by name or the least used nodes when 'auto' is specified.
     *
     * @param {string} [identifier='auto'] - Node name or 'auto' to select least used.
     * @returns {Promise<Node | Node[]>} A node instance or array of nodes.
     */
    public async fetchNode(identifier: string = 'auto'): Promise<Node | Node[]> {
        if (!this.nodes.size) {
            throw new Error('There are no available nodes currently.');
        }

        if (identifier === 'auto') return this.leastUsedNodes;

        const node = this.nodes.get(identifier);
        if (!node) {
            throw new Error('The node identifier you specified doesn\'t exist');
        }

        if (!node.isConnected) await node.connect();
        return node;
    }

    /**
     * Creates (or returns existing) a player for a specific guild.
     *
     * @param {ConnectionOptions} options - Options for player creation.
     * @returns {Player} The created or existing player.
     * @throws {Error} If Ruvyrias is not initialized or no nodes are available.
     */
    public createPlayer(options: ConnectionOptions): Player {
        if (!this.options.isInitialized) {
            throw new Error('Ruvyrias must be initialized in your ready event.');
        }

        const player = this.players.get(options.guildId);
        if (player) return player;

        const node = this.selectNode(options.region);

        if (!node) {
            throw new Error('There are no available nodes currently.');
        }

        return this.instantiatePlayer(node, options);
    }

    /**
     * Selects a node based on region or least used nodes.
     *
     * @param {string} [region] - Optional region for node selection.
     * @returns {Node | undefined} The selected node or undefined.
     */
    private selectNode(region?: string): Node | undefined {
        if (!this.leastUsedNodes.length) return undefined;

        if (region) {
            const regionNode = this.getNodesByRegion(region)[0];
            if (regionNode) {
                return this.nodes.get(regionNode.options?.name ?? this.leastUsedNodes[0].options?.name as string);
            }
        }
        return this.nodes.get(this.leastUsedNodes[0]?.options?.name as string);
    }

    /**
     * Creates a player instance for a specific guild using a given node.
     *
     * @param {Node} node - The node to associate with the player.
     * @param {ConnectionOptions} options - Options for creating the player.
     * @returns {Player} The created player instance.
     */
    private instantiatePlayer(node: Node, options: ConnectionOptions): Player {
        const player = new Player(this, node, options);

        this.players.set(options.guildId, player);
        player.joinVoiceChannel(options);
        this.emit(RuvyriasEvent.PlayerCreate, player);
        this.emit(RuvyriasEvent.Debug, options.guildId, 'Ruvyrias -> Player -> Player has been successfully created.');

        return player;
    }

    /**
     * Destroys the player associated with a guild.
     *
     * @param {string} guildId - The guild ID of the player to destroy.
     * @returns {boolean | null} True if destroyed, null if no player existed.
     */
    public destroyPlayer(guildId: string): boolean | null {
        const player = this.players.get(guildId);
        if (!player) return null;

        this.emit(RuvyriasEvent.PlayerDestroy, player);
        this.emit(RuvyriasEvent.Debug, guildId, 'Ruvyrias -> Player -> Player has been successfully destroyed.');
        this.players.delete(guildId);

        return true;
    }

    /**
     * Removes a player's connection for a specific guild.
     *
     * @param {string} guildId - The guild ID of the player.
     * @returns {Promise<boolean>} True if the connection was removed, false otherwise.
     */
    public async disconnectPlayer(guildId: string): Promise<boolean> {
        this.players.delete(guildId);
        return await this.players.get(guildId)?.stop() ?? false;
    }

    /**
     * Returns nodes sorted by their current load, least used first.
     *
     * @returns {Node[]} Array of least used nodes.
     */
    public get leastUsedNodes(): Node[] {
        return [...this.nodes.values()]
            .filter((node) => node.isConnected)
            .sort((a, b) => a.penalties - b.penalties);
    }

    /**
     * Searches for tracks based on query and optional source using a specified or least used node.
     *
     * @param {ResolveOptions} options - Search options including query, source, and requester.
     * @param {Node} [node] - Optional node to use for search.
     * @returns {Promise<Response>} A Response object containing resolved track information.
     */
    public async search({ query, source, requester }: ResolveOptions, node?: Node): Promise<Response> {
        if (!this.options.isInitialized) {
            throw new Error('Ruvyrias must be initialized in your ready event.');
        }

        if (this.leastUsedNodes.length === 0) {
            throw new Error('There are no available nodes currently.');
        }

        node = node ?? this.leastUsedNodes[0];

        const trackIdentifier = /^https?:\/\//.test(query) ? query : `${source ?? 'ytsearch'}:${query}`;
        const response = await node.rest.get(`/v4/loadtracks?identifier=${encodeURIComponent(trackIdentifier)}`) as LoadTrackResponse;
        return new Response(response, requester);
    }

    /**
     * Decodes a single track string into track data using a specified or least used node.
     *
     * @param {string} track - The encoded track string.
     * @param {Node} [node] - Optional node for decoding.
     * @returns {Promise<TrackData>} Decoded track information.
     */
    public async decodeSingleTrack(track: string, node?: Node): Promise<TrackData> {
        if (!node) node = this.leastUsedNodes[0];

        return await node.rest.get(`/v4/decodetrack?encodedTrack=${encodeURIComponent(track)}`) as TrackData;
    }

    /**
     * Decodes multiple track strings into Track objects using a specified or least used node.
     *
     * @param {string[]} tracks - Array of encoded track strings.
     * @param {Node} [node] - Optional node for decoding.
     * @returns {Promise<Track[]>} Array of decoded tracks.
     */
    public async decodeMultipleTracks(tracks: string[], node?: Node): Promise<Track[]> {
        if (!node) node = this.leastUsedNodes[0];

        return await node.rest.post(`/v4/decodetracks`, tracks) as Track[];
    }

    /**
     * Retrieves Lavalink node information.
     *
     * @param {string} name - The name of the node.
     * @returns {Promise<NodeInfoResponse>} Node information object.
     */
    public async fetchNodeInfo(name: string): Promise<NodeInfoResponse> {
        const node = this.nodes.get(name);
        if (!node) {
            throw new Error('Node not found!');
        }

        return await node.rest.get(`/v4/info`) as NodeInfoResponse;
    }

    /**
     * Retrieves Lavalink node stats.
     *
     * @param {string} name - The name of the node.
     * @returns {Promise<NodeStatsResponse>} Node statistics object.
     */
    public async fetchNodeStats(name: string): Promise<NodeStatsResponse> {
        const node = this.nodes.get(name);
        if (!node) {
            throw new Error('Node not found!');
        }

        return await node.rest.get(`/v4/stats`) as NodeStatsResponse;
    }

    /**
     * Retrieves the Lavalink version running on a node.
     *
     * @param {string} name - The name of the node.
     * @returns {Promise<string>} Lavalink version string.
     */
    public async fetchNodeVersion(name: string): Promise<string> {
        const node = this.nodes.get(name)
        if (!node) {
            throw new Error('Node not found!');
        }

        return await node.rest.get(`/version`) as string;
    }

    /**
     * Retrieves a player instance for the specified guild.
     *
     * @param {string} guildId - Guild ID.
     * @returns {Player | null} The player instance or null if not found.
     */
    public get(guildId: string): Player | null {
        return this.players.get(guildId) ?? null;
    }
}