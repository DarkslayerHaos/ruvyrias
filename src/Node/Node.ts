import { Ruvyrias, RuvyriasOptions, NodeGroup } from '../Ruvyrias';
import WebSocket from 'ws';
import { Config } from '../Config';
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
 * This interface represents the LavaLink V4 Error Responses
 * @reference https://lavalink.dev/api/rest.html#error-responses
 */
export interface ErrorResponses {
    timestamp: number;
    status: number;
    error: string;
    trace?: string;
    message: string;
    path: string;
}

export class Node {
    public ruvyrias: Ruvyrias;
    public readonly name: string;
    public readonly password: string;
    public readonly secure: boolean;
    public readonly regions: Array<string> | null;
    public sessionId: string | null;
    public readonly socketURL: string;
    public readonly restURL: string;
    public readonly rest: Rest;
    public ws: WebSocket | null;
    public readonly autoResume: boolean;
    public readonly resumeTimeout: number;
    public readonly reconnectTimeout: number;
    public readonly reconnectTries: number;
    public reconnectAttempt: NodeJS.Timeout | null;
    public attempt: number;
    public stats: NodeStats | null;
    public isConnected: boolean;
    public readonly options: NodeGroup;
    
    /**
     * The Node class that is used to connect to a lavalink node
     * @param ruvyrias Ruvyrias
     * @param node NodeGroup
     * @param options RuvyriasOptions
     */
    constructor(ruvyrias: Ruvyrias, node: NodeGroup, options: RuvyriasOptions) {
        this.ruvyrias = ruvyrias;
        this.name = node.name;
        this.password = node.password ?? 'youshallnotpass';
        this.secure = node.secure ?? false;
        this.regions = node.region ?? null;
        this.sessionId = null;
        this.options = node;
        this.socketURL = `ws${node.secure ? 's' : ''}://${node.host}:${node.port}/v4/websocket`;
        this.restURL = `http${node.secure ? 's' : ''}://${node.host}:${node.port}`;
        this.rest = new Rest(ruvyrias, this);
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
     * @returns {void}
     */
    public connect(): void {
        if (this.ws) this.ws.close();
        if (!this.ruvyrias.nodes.get(this.name)) {
            this.ruvyrias.nodes.set(this.name, this)
        }
        const headers = {
            'Authorization': this.password,
            'User-Id': this.ruvyrias.options.clientId,
            'Client-Name': Config.clientName,
        };
        if (this.sessionId) headers['Session-Id'] = this.sessionId;
        this.ws = new WebSocket(`${this.socketURL}`, { headers });
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
    public send(payload: any): void {
        const data = JSON.stringify(payload);
        this.ws?.send(data, (error: any) => {
            if (error) return error;
            return null;
        });
    }

    /**
     * Initiates a reconnection attempt to the Lavalink node.
     * @returns {void}
     */
    public reconnect(): void {
        this.reconnectAttempt = setTimeout(() => {
            if (this.attempt > this.reconnectTries) {
                throw new Error(`[Ruvyrias Websocket] Unable to connect with ${this.name} node after ${this.reconnectTries} tries`);
            }
            this.isConnected = false;
            this.ws?.removeAllListeners();
            this.ws = null;
            this.ruvyrias.emit('nodeReconnect', this);
            this.connect();
            this.attempt++;
        }, this.reconnectTimeout);
    }

    /**
     * Disconnects the Lavalink node.
     * @returns {Promise<void>} void
     */
    public async disconnect(): Promise<void> {
        if (!this.isConnected) return;

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
    get penalties(): number {
        let penalties = 0;
        if (!this.isConnected) return penalties;
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
        if (this.reconnectAttempt) {
            clearTimeout(this.reconnectAttempt);
            delete this.reconnectAttempt;
        }

        this.ruvyrias.emit('nodeConnect', this);
        this.isConnected = true;
        this.ruvyrias.emit('debug', this.name, `[Web Socket] Connection ready ${this.socketURL}`);

        if (this.autoResume) {
            for (const player of this.ruvyrias.players.values()) {
                if (player.node === this) {
                    await player.restart();
                }
            }
        }
    }

    /**
     * This function will set the stats accordingly from the NodeStats
     * @param {NodeStats} packet The NodeStats
     * @returns {void} void 
     */
    private setStats(packet: NodeStats): void {
        this.stats = packet;
    }

    /**
     * This will send a message to the node
     * @param {any} payload any 
     * @returns {Promise<void>} void
     */
    private async message(payload: any): Promise<void> {
        const packet = JSON.parse(payload);
        if (!packet?.op) return;

        this.ruvyrias.emit('raw', 'Node', packet)
        this.ruvyrias.emit('debug', this.name, `[Web Socket] Lavalink Node Update : ${JSON.stringify(packet)} `);

        if (packet.op === 'stats') {
            delete packet.op;
            this.setStats(packet);
        }
        if (packet.op === 'ready') {
            this.rest.setSessionId(packet.sessionId);
            this.sessionId = packet.sessionId;
            this.ruvyrias.emit('debug', this.name, `[Web Socket] Ready Payload received ${JSON.stringify(packet)}`)
            if (this.options.resume) {
                await this.rest.patch(`/v4/sessions/${this.sessionId}`, { resuming: this.options.resume, timeout: this.resumeTimeout })
                this.ruvyrias.emit('debug', this.name, `[Lavalink Rest] Resuming configured on Lavalink`);
            }

        }
        const player = this.ruvyrias.players.get(packet.guildId);
        if (packet.guildId && player) player.emit(packet.op, packet);
    }

    /**
     * This will close the connection to the node
     * @param {any} event any
     * @returns {void} void
     */
    private close(event: any): void {
        this.disconnect();
        this.ruvyrias.emit('nodeDisconnect', this, event);
        this.ruvyrias.emit('debug', this.name, `[Web Socket] Connection closed with Error code : ${event ?? 'Unknown code'}`);
        if (event !== 1000) this.reconnect();
    }

    /**
     * This function will emit the error so that the user's listeners can get them and listen to them
     * @param {any} event any
     * @returns {void} void
     */
    private error(event: any): void {
        if (!event) return;
        this.ruvyrias.emit('nodeError', this, event);
        this.ruvyrias.emit('debug', `[Web Socket] Connection for Lavalink Node (${this.name}) has error code: ${event.code ?? event}`);
    }

    /**
     * This function will get the RoutePlanner status
     * @returns {Promise<unknown>}
     */
    public async getRoutePlannerStatus(): Promise<unknown> {
        return await this.rest.get(`/v4/routeplanner/status`);
    }

    /**
     * This function will Unmark a failed address
     * @param {string} address The address to unmark as failed. This address must be in the same ip block.
     * @returns {ErrorResponses | unknown} This function will most likely error if you havn't enabled the route planner
     */
    public async unmarkFailedAddress(address: string): Promise<ErrorResponses | unknown> {
        return this.rest.post(`/v4/routeplanner/free/address`, { address });
    }
}