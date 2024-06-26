import { Ruvyrias, RuvyriasOptions, NodeGroup } from '../Ruvyrias';
import WebSocket from 'ws';
import { Config } from '../Config';
import { Rest } from './Rest';
import { PlayerEventType } from '../Player/Player';

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
interface LavalinkReadyPacket {
    op: 'ready';
    resumed: boolean;
    sessionId: string;
};

/**
 * Dispatched every x seconds with the latest player state
 */
interface LavalinkPlayerUpdatePacket {
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
interface LavalinkNodeStatsPacket extends NodeStats {
    op: 'stats';
};

/**
 * Dispatched when player or voice events occur
 */
type LavalinkEventPacket = { op: 'event' } & PlayerEventType;

/**
 * Represents the various types of packets that can be dispatched by Lavalink.
 */
type LavalinkPackets = LavalinkReadyPacket | LavalinkPlayerUpdatePacket | LavalinkNodeStatsPacket | LavalinkEventPacket;

/**
 * Represents an combo of additional options to node, directly brought from RuvyriasOptions
 */
interface Extras extends RuvyriasOptions {
    reconnectAttempt: NodeJS.Timeout | null;
    currentAttempt: number;
    isConnected: boolean;
};

/**
 * Represents a connection to a Lavalink node, allowing communication and control over audio playback.
 */
export class Node {
    public ruvyrias: Ruvyrias;
    public ws: WebSocket | null;
    public readonly restURL: string;
    public readonly socketURL: string;
    public readonly rest: Rest;
    public stats: NodeStats | null;
    public readonly options: NodeGroup;
    public readonly extras: Omit<Extras, 'library'>

    /**
     * The Node class that is used to connect to a lavalink node
     * @param {Ruvyrias} ruvyrias
     * @param {NodeGroup} node
     * @param {RuvyriasOptions} options
     */
    constructor(ruvyrias: Ruvyrias, node: NodeGroup, options: RuvyriasOptions) {
        this.ruvyrias = ruvyrias;
        this.ws = null;
        this.options = {
            name: node.name,
            host: node.host,
            port: node.port,
            password: node.password,
            resume: node.resume ?? false,
            secure: node.secure ?? false,
            region: node.region ?? null,
        };
        this.extras = {
            autoResume: options.autoResume ?? false,
            resumeTimeout: options.resumeTimeout ?? 60,
            reconnectTimeout: options.reconnectTimeout ?? 5000,
            reconnectTries: options.reconnectTries ?? 5,
            reconnectAttempt: null,
            currentAttempt: 0,
            isConnected: false,
        }
        this.rest = new Rest(ruvyrias, this);
        this.restURL = `http${node.secure ? 's' : ''}://${this.options.host}:${this.options.port}`;
        this.socketURL = `ws${node.secure ? 's' : ''}://${this.options.host}:${this.options.port}/v4/websocket`;
        this.stats = null;
    }

    /**
     * Establishes a connection to the Lavalink node.
     * @returns {Promise<void>}
     */
    public async connect(): Promise<void> {
        if (this.ws) this.ws.close();
        if (!this.ruvyrias.nodes.get(this.options.name)) {
            this.ruvyrias.nodes.set(this.options.name, this)
        }

        if (!this.ruvyrias.options.clientId) {
            throw new Error('[Ruvyrias Error] No user id found in the Ruvyrias instance. Consider using a supported library.');
        }

        const headers: { [key: string]: string } = {
            'Authorization': this.options.password,
            'User-Id': this.ruvyrias.options.clientId,
            'Client-Name': `${Config.clientName}/${Config.clientVersion}`,
        };

        if (this.rest.sessionId) headers['Session-Id'] = this.rest.sessionId;

        this.ws = new WebSocket(`${this.socketURL}`, { headers });
        this.ws.on('open', this.open.bind(this));
        this.ws.on('error', this.error.bind(this));
        this.ws.on('message', this.message.bind(this));
        this.ws.on('close', this.close.bind(this));
    }

    /**
     * Initiates a reconnection attempt to the Lavalink node.
     * @returns {Promise<void>}
     */
    public async reconnect(): Promise<void> {
        this.extras.reconnectAttempt = setTimeout(async () => {
            if (this.extras.currentAttempt > this.extras.reconnectTries!) {
                throw new Error(`[Ruvyrias Websocket] Unable to connect with ${this.options.name} node after ${this.extras.reconnectTries} tries.`);
            }
            this.extras.isConnected = false;
            this.ws?.removeAllListeners();
            this.ws = null;
            this.ruvyrias.emit('nodeReconnect', this);
            await this.connect();
            this.extras.currentAttempt++;
        }, this.extras.reconnectTimeout!);
    }

    /**
     * Disconnects the Lavalink node.
     * @returns {Promise<void>} void
     */
    public async disconnect(): Promise<void> {
        if (!this.extras.isConnected) return;

        this.ruvyrias.players.forEach(async (player) => {
            if (player.node == this) {
                await player.autoMoveNode();
            }
        });

        this.ws?.close(1000, 'destroy');
        this.ws?.removeAllListeners();
        this.ws = null;

        this.ruvyrias.nodes.delete(this.options.name);
        this.ruvyrias.emit('nodeDisconnect', this);
    }

    /**
      * Sends a payload to the Lavalink node.
      * @param {any} payload The payload to be sent.
      * @returns {void}
      */
    public send(payload: any): void {
        if (!this?.extras.isConnected ?? !this?.ws) {
            throw new Error('[Ruvyrias Error] The node is not connected.');
        }

        const data = JSON.stringify(payload);
        this.ws?.send(data, (error: any) => {
            if (error) return error;
            return null;
        });
    }

    /**
     * Returns the name of the node.
     * @returns {string} The name of the node.
     */
    public get name(): string {
        return this.options.name;
    }

    /**
     * Gets the penalties associated with the current node.
     * @returns {number} The total amount of penalties.
     */
    public get penalties(): number {
        let penalties = 0;
        if (!this?.extras.isConnected ?? this?.stats) return penalties;
        penalties += (this.stats as NodeStats)?.players;
        penalties += Math.round(
            Math.pow(1.05, 100 * (this.stats as NodeStats)?.cpu.systemLoad) * 10 - 10
        );
        if ((this.stats as NodeStats)?.frameStats) {
            penalties += (this.stats as NodeStats)?.frameStats.deficit;
            penalties += (this.stats as NodeStats)?.frameStats.nulled * 2;
        }
        return penalties;
    }

    /**
     * This function will open up again the node
     * @returns {Promise<void>} The void
     */
    private async open(): Promise<void> {
        try {
            if (this.extras.reconnectAttempt) {
                clearTimeout(this.extras.reconnectAttempt);
                this.extras.reconnectAttempt = null;
            }

            this.ruvyrias.emit('nodeConnect', this);
            this.extras.isConnected = true;
            this.ruvyrias.emit('debug', this.options.name, `[Web Socket] Connection ready: ${this.socketURL}.`);
        } catch (error) {
            this.ruvyrias.emit('debug', `[Web Socket] Error while opening the connection with the node ${this.options.name}.`, error)
        }
    }

    /**
     * This will send a message to the node
     * @param {string} payload The sent payload we recieved in stringified form
     * @returns {Promise<void>} Return void
     */
    private async message(payload: any): Promise<void> {
        try {
            const packet = JSON.parse(payload) as LavalinkPackets;
            if (!packet?.op) return;

            this.ruvyrias.emit('raw', 'Node', packet)
            this.ruvyrias.emit('debug', this.options.name, `[Web Socket] Lavalink Node Update: ${JSON.stringify(packet)}.`);

            switch (packet.op) {
                case 'ready': {
                    this.rest.setSessionId(packet.sessionId);
                    this.ruvyrias.emit('debug', this.options.name, `[Web Socket] Ready Payload received: ${JSON.stringify(packet)}.`);

                    // If autoResume is enabled, try reconnecting to the node
                    if (this.extras.autoResume) {
                        for (const player of this.ruvyrias.players.values()) {
                            if (player.node === this) {
                                await player.restart();
                            }
                        }
                    }

                    // If resume is enabled, try resuming the player
                    if (this.options.resume) {
                        await this.rest.patch(`/v4/sessions/${this.rest.sessionId}`, { resuming: this.options.resume, timeout: this.extras.resumeTimeout });
                        this.ruvyrias.emit('debug', this.options.name, `[Lavalink Rest] Resuming configured on Lavalink...`);
                    }

                    break;
                }

                // If the packet has stats about the node in it update them on the Node's class
                case 'stats': {
                    delete (packet as NodeStats & { op: string | undefined }).op;

                    this.stats = packet;
                    break;
                }

                // If the packet is an event or playerUpdate emit the event to the player
                case 'event':
                case 'playerUpdate': {
                    const player = this.ruvyrias.players.get((packet as LavalinkPlayerUpdatePacket).guildId);
                    if ((packet as LavalinkPlayerUpdatePacket).guildId && player) player.emit(packet.op, packet);
                    break;
                }

                default: break;
            }
        } catch (error) {
            this.ruvyrias.emit('debug', '[Web Socket] Error while parsing the payload.', error);
        }
    }

    /**
     * This will close the connection to the node
     * @param {any} event any
     * @returns {Promise<void>} void
     */
    private async close(event: any): Promise<void> {
        try {
            await this.disconnect();
            this.ruvyrias.emit('nodeDisconnect', this, event);
            this.ruvyrias.emit('debug', this.options.name, `[Web Socket] Connection closed with Error code: ${event ?? 'Unknown code'}.`);
            if (event !== 1000) await this.reconnect();
        } catch (error) {
            this.ruvyrias.emit('debug', '[Web Socket] Error while closing the connection with the node.', error);
        }
    }

    /**
     * This function will emit the error so that the user's listeners can get them and listen to them
     * @param {any} event any
     * @returns {void} void
     */
    private error(event: any): void {
        if (!event) return;
        this.ruvyrias.emit('nodeError', this, event);
        this.ruvyrias.emit('debug', `[Web Socket] Connection for Lavalink Node (${this.options?.name}) has error code: ${event?.code ?? event}.`);
    }
}