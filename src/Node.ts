import { NodeStats, NodeGroup, Extras, LavalinkPlayerUpdatePacket } from '../types';
import { RuvyriasEvent, RuvyriasOptions } from '../types';
import { Ruvyrias } from './Ruvyrias';
import { version } from '../index';
import { Rest } from './Rest';
import WebSocket from 'ws';

/**
 * Represents a connection to a Lavalink node, allowing communication and control over audio playback.
 */
export class Node {
    public ruvyrias: Ruvyrias;
    public isConnected: boolean;
    private ws: WebSocket | null;
    private readonly restURL: string;
    private readonly socketURL: string;
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
        this.isConnected = false;;
        this.options = {
            name: node.name ?? 'Default',
            host: node.host,
            port: node.port,
            auth: node.auth,
            secure: node.secure ?? false,
            region: node.region ?? null,
        };
        this.extras = {
            resume: options.resume ?? false,
            autoResume: options.autoResume ?? false,
            resumeTimeout: options.resumeTimeout ?? 60,
            retryDelay: options.retryDelay ?? 5000,
            retryAmount: options.retryAmount ?? 5,
            retryAttempt: null,
            currentAttempt: 0,
        }
        this.rest = new Rest(ruvyrias, this);
        this.restURL = `http${node.secure ? 's' : ''}://${this.options.host}:${this.options.port}`;
        this.socketURL = `ws${node.secure ? 's' : ''}://${this.options.host}:${this.options.port}/v4/websocket`;
        this.stats = null;
    }

    /**
     * Establishes a connection to the Lavalink node.
     * @returns {Promise<void>} Resolves when the connection attempt is initiated.
     */
    public async connect(): Promise<void> {
        if (this.ws) this.ws.close();
        if (!this.ruvyrias.nodes.get(this.options.name as string)) {
            this.ruvyrias.nodes.set(this.options.name as string, this)
        }

        if (!this.ruvyrias.options.clientId) {
            throw new Error('No user id was found in the Ruvyrias instance, please check if you are using a supported library.');
        }

        const headers: { [key: string]: string } = {
            'Authorization': this.options.auth,
            'User-Id': this.ruvyrias.options.clientId,
            'Client-Name': `Ruvyrias/${version}`,
        };

        if (this.rest.sessionId) headers['Session-Id'] = this.rest.sessionId;

        this.ws = new WebSocket(`${this.socketURL}`, { headers });
        this.ws.on('open', this.open.bind(this));
        this.ws.on('error', this.error.bind(this));
        this.ws.on('message', this.message.bind(this));
        this.ws.on('close', this.close.bind(this));
    }

    /**
     * Attempts to reconnect to the Lavalink node after a delay.
     * @returns {Promise<void>} Resolves when the reconnection attempt is scheduled.
     */
    public async reconnect(): Promise<void> {
        this.extras.retryAttempt = setTimeout(async () => {
            if (this.extras.currentAttempt > this.extras.retryAmount!) {
                throw new Error(`Unable to connect with ${this.options.name} node after ${this.extras.retryAmount} tries.`);
            }
            this.isConnected = false;
            this.ws?.removeAllListeners();
            this.ws = null;
            this.ruvyrias.emit(RuvyriasEvent.NodeReconnect, this);
            await this.connect();
            this.extras.currentAttempt++;
        }, this.extras.retryDelay!);
    }

    /**
     * Disconnects from the Lavalink node and cleans up resources.
     * @returns {Promise<void>} Resolves when the node is fully disconnected.
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

        this.ruvyrias.nodes.delete(this.options.name as string);
        this.ruvyrias.emit(RuvyriasEvent.Debug, this);
    }

    /**
     * Sends a payload to the Lavalink node over WebSocket.
     * @param {any} payload - The payload to send.
     * @throws {Error} If the node is not connected.
     */
    public send(payload: any): void {
        if (!this?.isConnected || !this?.ws) {
            throw new Error('The node is not connected.');
        }

        const data = JSON.stringify(payload);
        this.ws?.send(data, (error: any) => {
            if (error) return error;
            return null;
        });
    }

    /**
     * Gets the name of the node.
     * @returns {string} The node's name.
     */
    public get name(): string {
        return this.name;
    }

    /**
     * Calculates and returns the penalty score for this node.
     * @returns {number} The total penalty value.
     */
    public get penalties(): number {
        let penalties = 0;
        if (!this?.isConnected || this?.stats) return penalties;
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
     * Handles the 'open' WebSocket event, marking the node as connected.
     * @private
     * @returns {Promise<void>} Resolves when connection initialization completes.
     */
    private async open(): Promise<void> {
        try {
            if (this.extras.retryAttempt) {
                clearTimeout(this.extras.retryAttempt);
                this.extras.retryAttempt = null;
            }

            this.ruvyrias.emit(RuvyriasEvent.NodeConnect, this);
            this.isConnected = true;
            this.ruvyrias.emit(RuvyriasEvent.Debug, this.options.name, `Ruvyrias ->  Web Socket ->  Connection ready: ${this.socketURL}.`);
        } catch (error) {
            this.ruvyrias.emit(RuvyriasEvent.Debug, `Ruvyrias ->  Web Socket ->  Error while opening the connection with the node ${this.options.name}.`, error)
        }
    }

    /**
     * Handles incoming WebSocket messages from the Lavalink node.
     * @private
     * @param {any} payload - The received message payload in stringified form.
     * @returns {Promise<void>} Resolves after processing the message.
     */
    private async message(payload: any): Promise<void> {
        try {
            const packet = JSON.parse(payload);
            if (!packet?.op) return;

            this.ruvyrias.emit(RuvyriasEvent.Raw, 'Node', packet)
            this.ruvyrias.emit(RuvyriasEvent.Debug, `Node '${this.options.name}' Ruvyrias -> Web Socket -> Lavalink Node Update: ${JSON.stringify(packet)}.`);

            switch (packet.op) {
                case 'ready': {
                    this.rest.setSessionId(packet.sessionId);
                    this.ruvyrias.emit(RuvyriasEvent.Debug, `Node '${this.options.name}' Ruvyrias -> Web Socket -> Ready Payload received: ${JSON.stringify(packet)}.`);

                    // If autoResume is enabled, try reconnecting to the node
                    if (this.extras.autoResume) {
                        for (const player of this.ruvyrias.players.values()) {
                            if (player.node === this) {
                                await player.restart();
                            }
                        }
                    }

                    // If resume is enabled, try resuming the player
                    if (this.ruvyrias.options.resume) {
                        await this.rest.patch(`/v4/sessions/${this.rest.sessionId}`, { resuming: true, timeout: this.extras.resumeTimeout });
                        this.ruvyrias.emit(RuvyriasEvent.Debug, `Node '${this.options.name}' Ruvyrias -> Lavalink Rest -> Resuming configured on Lavalink...`);
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
            this.ruvyrias.emit(RuvyriasEvent.Debug, 'Ruvyrias -> Web Socket -> Error while parsing the payload.', error);
        }
    }

    /**
     * Handles the 'close' WebSocket event, disconnecting and possibly reconnecting.
     * @private
     * @param {any} event - The close event information.
     * @returns {Promise<void>} Resolves when the node is closed and reconnection is attempted if needed.
     */
    private async close(event: any): Promise<void> {
        try {
            await this.disconnect();
            this.ruvyrias.emit(RuvyriasEvent.Debug, this, event);
            this.ruvyrias.emit(RuvyriasEvent.Debug, `Node '${this.options.name}' Ruvyrias -> Web Socket -> Connection closed with Error code: ${event ?? 'Unknown code'}.`);
            if (event !== 1000) await this.reconnect();
        } catch (error) {
            this.ruvyrias.emit(RuvyriasEvent.Debug, 'Ruvyrias -> Web Socket -> Error while closing the connection with the node.', error);
        }
    }

    /**
     * Handles WebSocket errors and emits them to the user's listeners.
     * @private
     * @param {any} event - The error event object.
     * @returns {void}
     */
    private error(event: any): void {
        if (!event) return;
        this.ruvyrias.emit(RuvyriasEvent.NodeError, this, event);
        this.ruvyrias.emit(RuvyriasEvent.Debug, `Ruvyrias ->  Web Socket ->  Connection for Lavalink Node (${this.options?.name}) has error code: ${event?.code ?? event}.`);
    }
}