"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ruvyrias = exports.AppleMusic = exports.Spotify = exports.Deezer = void 0;
const Node_1 = require("./Node/Node");
const Player_1 = require("./Player/Player");
const events_1 = require("events");
const Config_1 = require("./Config");
const Response_1 = require("./Guild/Response");
const deezer_1 = require("../plugins/deezer");
Object.defineProperty(exports, "Deezer", { enumerable: true, get: function () { return deezer_1.Deezer; } });
const spotify_1 = require("../plugins/spotify");
Object.defineProperty(exports, "Spotify", { enumerable: true, get: function () { return spotify_1.Spotify; } });
const applemusic_1 = require("../plugins/applemusic");
Object.defineProperty(exports, "AppleMusic", { enumerable: true, get: function () { return applemusic_1.AppleMusic; } });
/**
 * Represents the main Ruvyrias instance, coordinating interactions with nodes and players.
 */
class Ruvyrias extends events_1.EventEmitter {
    client;
    _nodes;
    options;
    nodes;
    players;
    send;
    /**
     * This is the main class of Ruvyrias
     * @param {Client | any} client VoiceClient for Ruvyrias library to use to connect to lavalink node server (discord.js, eris, oceanic)
     * @param {NodeGroup[]} nodes Node
     * @param {RuvyriasOptions} options RuvyriasOptions
     * @returns Ruvyrias
     */
    constructor(client, nodes, options) {
        super();
        this.client = client;
        this._nodes = nodes;
        this.nodes = new Map();
        this.players = new Map();
        this.options = {
            clientName: Config_1.Config.clientName,
            clientVersion: Config_1.Config.clientVersion,
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
    async init(client) {
        if (this.options.isActivated)
            return this;
        this.options.clientId = client.user?.id;
        this._nodes.forEach(async (node) => await this.addNode(node));
        this.options.isActivated = true;
        if (this.options.plugins) {
            this.options.plugins.forEach((plugin) => {
                plugin.load(this);
            });
        }
        if (!this.options.library)
            this.options.library = 'discord.js';
        switch (this.options.library) {
            case 'discord.js': {
                this.send = (packet) => {
                    const guild = client.guilds.cache.get(packet.d.guild_id);
                    if (guild)
                        guild.shard?.send(packet);
                };
                client.on('raw', async (packet) => {
                    this.packetUpdate(packet);
                });
                break;
            }
            case 'eris': {
                this.send = (packet) => {
                    const guild = client.guilds.get(packet.d.guild_id);
                    if (guild)
                        guild.shard.sendWS(packet?.op, packet?.d);
                };
                client.on('rawWS', async (packet) => {
                    this.packetUpdate(packet);
                });
                break;
            }
            case 'oceanic': {
                this.send = (packet) => {
                    const guild = client.guilds.get(packet.d.guild_id);
                    if (guild)
                        guild.shard.send(packet?.op, packet?.d);
                };
                client.on('packet', async (packet) => {
                    this.packetUpdate(packet);
                });
                break;
            }
            case 'other': {
                if (!this.send) {
                    throw new Error('Send function is required in Ruvyrias Options');
                }
                this.send = this.options.send;
                break;
            }
        }
        return this;
    }
    /**
     * Handles Voice State Update and Voice Server Update packets from the Discord API.
     * @param {Packet} packet Packet from Discord API.
     * @returns {void}
     */
    packetUpdate(packet) {
        if (!['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(packet.t))
            return;
        const player = this.players.get(packet.d.guild_id);
        if (!player)
            return;
        if (packet.t === 'VOICE_SERVER_UPDATE') {
            player.connection.setServersUpdate(packet.d);
        }
        if (packet.t === 'VOICE_STATE_UPDATE') {
            if (packet.d.user_id !== this.options.clientId)
                return;
            player.connection.setStateUpdate(packet.d);
        }
    }
    /**
     * Adds a node to the Ruvyrias instance.
     * @param {NodeGroup} options - NodeGroup containing node configuration.
     * @returns {Promise<Node>} - The created Node instance.
     */
    async addNode(options) {
        const node = new Node_1.Node(this, options, this.options);
        this.nodes.set(options.name, node);
        await node.connect();
        return node;
    }
    /**
     * Removes a node from the Ruvyrias instance.
     * @param {string} identifier - Node name.
     * @returns {Promise<boolean>} Whether the node was successfully removed.
     */
    async removeNode(identifier) {
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
    getNodeByRegion(region) {
        return [...this.nodes.values()]
            .filter((node) => node.isConnected && node.regions?.includes(region?.toLowerCase()))
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
    getNode(identifier = 'auto') {
        if (!this.nodes.size) {
            throw new Error(`No nodes available currently`);
        }
        if (identifier === 'auto')
            return this.leastUsedNodes;
        const node = this.nodes.get(identifier);
        if (!node) {
            throw new Error('The node identifier you specified doesn\'t exist');
        }
        if (!node.isConnected)
            node.connect();
        return node;
    }
    /**
     * Creates a player connection for the specified guild using the provided options.
     * @param {ConnectionOptions} options - Options for creating the player connection.
     * @returns {Player} The created or existing Player instance for the specified guild.
     */
    createConnection(options) {
        if (!this.options.isActivated) {
            throw new Error(`Ruvyrias must be initialized in your ready event.`);
        }
        const player = this.players.get(options.guildId);
        if (player)
            return player;
        if (this.leastUsedNodes.length === 0) {
            throw new Error('[Ruvyrias Error] No nodes are available.');
        }
        let node;
        if (options.region) {
            const regionNode = this.getNodeByRegion(options.region)[0];
            node = this.nodes.get(regionNode.name ?? this.leastUsedNodes[0].name);
        }
        else {
            node = this.nodes.get(this.leastUsedNodes[0].name);
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
    createPlayer(node, options) {
        let player;
        if (this.options.customPlayer) {
            player = new this.options.customPlayer(this, node, options);
        }
        else {
            player = new Player_1.Player(this, node, options);
        }
        this.players.set(options.guildId, player);
        player.connect(options);
        return player;
    }
    /**
     * Removes a player associated with the specified guild from Ruvyrias instance.
     * @param {string} guildId - The ID of the guild for which to remove the player.
     * @returns {Promise<boolean>} A promise that resolves to true if the player is successfully removed; otherwise, false.
     */
    async removeConnection(guildId) {
        return await this.players.get(guildId)?.stop() ?? false;
    }
    /**
     * Gets an array of least used nodes from the Ruvyrias instance.
     * @returns {Node[]} An array of least used nodes.
     */
    get leastUsedNodes() {
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
    async resolve({ query, source, requester }, node) {
        if (!this.options.isActivated) {
            throw new Error(`Ruvyrias must be initialized in your ready event.`);
        }
        if (this.leastUsedNodes.length === 0) {
            throw new Error('No nodes are available.');
        }
        node = node ?? this.leastUsedNodes[0];
        const trackIdentifier = /^https?:\/\//.test(query) ? query : `${source ?? 'ytsearch'}:${query}`;
        const response = await node.rest.get(`/v4/loadtracks?identifier=${encodeURIComponent(trackIdentifier)}`);
        return new Response_1.Response(response, requester);
    }
    /**
     * Decode a track from Ruvyrias instance.
     * @param {string} track - The encoded track.
     * @param {Node} [node] - The node to decode the track on. If not provided, the least used node will be used.
     * @returns {Promise<TrackData>} A promise that resolves to the decoded track.
     */
    async decodeTrack(track, node) {
        if (!node)
            node = this.leastUsedNodes[0];
        return await node.rest.get(`/v4/decodetrack?encodedTrack=${encodeURIComponent(track)}`);
    }
    /**
     * Decode tracks from Ruvyrias instance.
     * @param {string[]} tracks - The encoded strings.
     * @param {Node} [node] - The node to decode the tracks on. If not provided, the least used node will be used.
     * @returns {Promise<Track[]>} A promise that resolves to an array of decoded tracks.
     */
    async decodeTracks(tracks, node) {
        if (!node)
            node = this.leastUsedNodes[0];
        return await node.rest.post(`/v4/decodetracks`, tracks);
    }
    /**
     * Get lavalink info from Ruvyrias instance
     * @param {string} name The name of the node
     * @returns {NodeInfoResponse} Useful information about the node.
     */
    async getLavalinkInfo(name) {
        const node = this.nodes.get(name);
        if (!node) {
            throw new Error('Node not found!');
        }
        return await node.rest.get(`/v4/info`);
    }
    /**
     * Get lavalink status from Ruvyrias instance
     * @param {string} name The name of the node
     * @returns {NodeStatsResponse} The stats from the node
     */
    async getLavalinkStatus(name) {
        const node = this.nodes.get(name);
        if (!node) {
            throw new Error('Node not found!');
        }
        return await node.rest.get(`/v4/stats`);
    }
    /**
    * Get the current lavalink version of the node
    * @param {string} name The name of the node
    * @returns {Promise<string>} The version of the node
    */
    async getLavalinkVersion(name) {
        const node = this.nodes.get(name);
        if (!node) {
            throw new Error('Node not found!');
        }
        return await node.rest.get(`/version`);
    }
    /**
     * Get a player from Ruvyrias instance.
     * @param {string} guildId - Guild ID.
     * @returns {Player | undefined} The player instance for the specified guild or undefined in case of nothing.
     */
    get(guildId) {
        return this.players.get(guildId);
    }
}
exports.Ruvyrias = Ruvyrias;
