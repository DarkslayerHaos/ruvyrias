"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const ws_1 = __importDefault(require("ws"));
const Config_1 = require("../Config");
const Rest_1 = require("./Rest");
;
;
;
/**
 * Represents a connection to a Lavalink node, allowing communication and control over audio playback.
 */
class Node {
    ruvyrias;
    name;
    password;
    secure;
    regions;
    sessionId;
    socketURL;
    restURL;
    rest;
    ws;
    autoResume;
    resumeTimeout;
    reconnectTimeout;
    reconnectTries;
    reconnectAttempt;
    attempt;
    stats;
    isConnected;
    options;
    /**
     * The Node class that is used to connect to a lavalink node
     * @param ruvyrias Ruvyrias
     * @param node NodeGroup
     * @param options RuvyriasOptions
     */
    constructor(ruvyrias, node, options) {
        this.ruvyrias = ruvyrias;
        this.name = node.name;
        this.password = node.password ?? 'youshallnotpass';
        this.secure = node.secure ?? false;
        this.regions = node.region ?? null;
        this.sessionId = null;
        this.options = node;
        this.socketURL = `ws${node.secure ? 's' : ''}://${node.host}:${node.port}/v4/websocket`;
        this.restURL = `http${node.secure ? 's' : ''}://${node.host}:${node.port}`;
        this.rest = new Rest_1.Rest(ruvyrias, this);
        this.ws = null;
        this.autoResume = options.autoResume ?? false;
        this.resumeTimeout = options.resumeTimeout ?? 60;
        this.reconnectTimeout = options.reconnectTimeout ?? 5000;
        this.reconnectTries = options.reconnectTries ?? 5;
        this.reconnectAttempt = null;
        this.attempt = 0;
        this.isConnected = false;
        this.stats = null;
    }
    /**
     * Establishes a connection to the Lavalink node.
     * @returns {Promise<void>}
     */
    async connect() {
        if (this.ws)
            this.ws.close();
        if (!this.ruvyrias.nodes.get(this.name)) {
            this.ruvyrias.nodes.set(this.name, this);
        }
        if (!this.ruvyrias.options.clientId) {
            throw new Error('[Ruvyrias Error] No user id found in the Ruvyrias instance. Consider using a supported library.');
        }
        const headers = {
            'Authorization': this.password,
            'User-Id': this.ruvyrias.options.clientId,
            'Client-Name': `${Config_1.Config.clientName}/${Config_1.Config.clientVersion}`,
        };
        if (this.sessionId)
            headers['Session-Id'] = this.sessionId;
        this.ws = new ws_1.default(`${this.socketURL}`, { headers });
        this.ws.on('open', this.open.bind(this));
        this.ws.on('error', this.error.bind(this));
        this.ws.on('message', this.message.bind(this));
        this.ws.on('close', this.close.bind(this));
    }
    /**
     * Sends a payload to the Lavalink node.
     * @param {any} payload The payload to be sent.
     * @returns {void}
     */
    send(payload) {
        if (!this?.isConnected ?? !this?.ws) {
            throw new Error('[Ruvyrias Error] The node is not connected.');
        }
        const data = JSON.stringify(payload);
        this.ws?.send(data, (error) => {
            if (error)
                return error;
            return null;
        });
    }
    /**
     * Initiates a reconnection attempt to the Lavalink node.
     * @returns {Promise<void>}
     */
    async reconnect() {
        this.reconnectAttempt = setTimeout(async () => {
            if (this.attempt > this.reconnectTries) {
                throw new Error(`[Ruvyrias Websocket] Unable to connect with ${this.name} node after ${this.reconnectTries} tries.`);
            }
            this.isConnected = false;
            this.ws?.removeAllListeners();
            this.ws = null;
            this.ruvyrias.emit('nodeReconnect', this);
            await this.connect();
            this.attempt++;
        }, this.reconnectTimeout);
    }
    /**
     * Disconnects the Lavalink node.
     * @returns {Promise<void>} void
     */
    async disconnect() {
        if (!this.isConnected)
            return;
        this.ruvyrias.players.forEach(async (player) => {
            if (player.node == this) {
                await player.autoMoveNode();
            }
        });
        this.ws?.close(1000, 'destroy');
        this.ws?.removeAllListeners();
        this.ws = null;
        this.ruvyrias.nodes.delete(this.name);
        this.ruvyrias.emit('nodeDisconnect', this);
    }
    /**
     * Gets the penalties associated with the current node.
     * @returns {number} The total amount of penalties.
     */
    get penalties() {
        let penalties = 0;
        if (!this?.isConnected ?? this?.stats)
            return penalties;
        penalties += this.stats?.players;
        penalties += Math.round(Math.pow(1.05, 100 * this.stats?.cpu.systemLoad) * 10 - 10);
        if (this.stats?.frameStats) {
            penalties += this.stats?.frameStats.deficit;
            penalties += this.stats?.frameStats.nulled * 2;
        }
        return penalties;
    }
    /**
     * This function will open up again the node
     * @returns {Promise<void>} The void
     */
    async open() {
        try {
            if (this.reconnectAttempt) {
                clearTimeout(this.reconnectAttempt);
                this.reconnectAttempt = null;
            }
            this.ruvyrias.emit('nodeConnect', this);
            this.isConnected = true;
            this.ruvyrias.emit('debug', this.name, `[Web Socket] Connection ready: ${this.socketURL}.`);
            if (this.autoResume) {
                for (const player of this.ruvyrias.players.values()) {
                    if (player.node === this) {
                        await player.restart();
                    }
                }
            }
        }
        catch (error) {
            this.ruvyrias.emit('debug', `[Web Socket] Error while opening the connection with the node ${this.name}.`, error);
        }
    }
    /**
     * This will send a message to the node
     * @param {string} payload The sent payload we recieved in stringified form
     * @returns {Promise<void>} Return void
     */
    async message(payload) {
        try {
            const packet = JSON.parse(payload);
            if (!packet?.op)
                return;
            this.ruvyrias.emit('raw', 'Node', packet);
            this.ruvyrias.emit('debug', this.name, `[Web Socket] Lavalink Node Update: ${JSON.stringify(packet)}.`);
            switch (packet.op) {
                case 'ready': {
                    this.rest.setSessionId(packet.sessionId);
                    this.sessionId = packet.sessionId;
                    this.ruvyrias.emit('debug', this.name, `[Web Socket] Ready Payload received: ${JSON.stringify(packet)}.`);
                    // If resume is enabled, try resuming the player
                    if (this.options.resume) {
                        await this.rest.patch(`/v4/sessions/${this.sessionId}`, { resuming: this.options.resume, timeout: this.resumeTimeout });
                        this.ruvyrias.emit('debug', this.name, `[Lavalink Rest] Resuming configured on Lavalink...`);
                    }
                    break;
                }
                // If the packet has stats about the node in it update them on the Node's class
                case 'stats': {
                    this.stats = packet;
                    break;
                }
                // If the packet is an event or playerUpdate emit the event to the player
                case 'event':
                case 'playerUpdate': {
                    const player = this.ruvyrias.players.get(packet.guildId);
                    if (packet.guildId && player)
                        player.emit(packet.op, packet);
                    break;
                }
                default: break;
            }
        }
        catch (error) {
            this.ruvyrias.emit('debug', '[Web Socket] Error while parsing the payload.', error);
        }
    }
    /**
     * This will close the connection to the node
     * @param {any} event any
     * @returns {Promise<void>} void
     */
    async close(event) {
        try {
            await this.disconnect();
            this.ruvyrias.emit('nodeDisconnect', this, event);
            this.ruvyrias.emit('debug', this.name, `[Web Socket] Connection closed with Error code: ${event ?? 'Unknown code'}.`);
            if (event !== 1000)
                await this.reconnect();
        }
        catch (error) {
            this.ruvyrias.emit('debug', '[Web Socket] Error while closing the connection with the node.', error);
        }
    }
    /**
     * This function will emit the error so that the user's listeners can get them and listen to them
     * @param {any} event any
     * @returns {void} void
     */
    error(event) {
        if (!event)
            return;
        this.ruvyrias.emit('nodeError', this, event);
        this.ruvyrias.emit('debug', `[Web Socket] Connection for Lavalink Node (${this?.name}) has error code: ${event?.code ?? event}.`);
    }
}
exports.Node = Node;
