import { VoiceServer, SetStateUpdate } from '../types';
import { RuvyriasEvent } from '../types';
import { Player } from './Player';

/**
 * Manages the connection between the player and an external source.
 */
export class Connection {
    public readonly player: Player;
    public region: string | null;
    public self_mute: boolean;
    public self_deaf: boolean;
    public channel_id: string | null;
    public session_id: string | null;
    public token: string | null;
    public endpoint: string | null;

    /**
     * The connection class
     * @param {Player} player
     */
    constructor(player: Player) {
        this.player = player;
        this.region = null;
        this.channel_id = null;
        this.session_id = null;
        this.self_mute = false;
        this.self_deaf = false;
        this.token = null;
        this.endpoint = null;
    }

    /**
     * Handles updates from the voice server, setting connection properties
     * and notifying the player node with the new voice session information.
     *
     * @param {VoiceServer} data - Object containing the voice server endpoint and token.
     * @throws {Error} If the endpoint is missing from the voice server data.
     * @returns {Promise<void>} Resolves when the player node has been updated.
     */
    public async updateVoiceServer(data: VoiceServer): Promise<void> {
        if (!data.endpoint) {
            throw new Error('No Session ID found.');
        }

        this.region = data.endpoint.split('.').shift()?.replace(/[0-9]/g, '') ?? null;
        this.token = data.token;
        this.endpoint = data.endpoint;

        await this.player.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: {
                voice: {
                    sessionId: this.session_id,
                    token: this.token,
                    endpoint: this.endpoint,
                }
            },
        });

        this.player.ruvyrias.emit(
            RuvyriasEvent.Debug,
            this.player.node.options.name,
            `Ruvyrias -> Voice Server Update | Server -> ${this.region} Guild: ${this.player.guildId}.`
        );
    }

    /**
     * Handles updates from the voice state, updating the connection's session,
     * channel, and mute/deaf status. Stops the player if the bot is removed
     * from the voice channel and updates the player's voice channel ID if it changed.
     *
     * @param {SetStateUpdate} data - Object containing session ID, channel ID, self-mute, and self-deaf status.
     * @returns {Promise<void>} Resolves after updating the connection state.
     */
    public async updateVoiceState(data: SetStateUpdate): Promise<void> {
        const { session_id, channel_id, self_deaf, self_mute } = data;

        if (channel_id == null) {
            this.player.stop();
        }

        if (this.player.voiceChannelId &&
            channel_id &&
            this.player.voiceChannelId !== channel_id
        ) {
            this.player.voiceChannelId = channel_id;
        }

        this.channel_id = channel_id;
        this.session_id = session_id;
        this.self_deaf = self_deaf;
        this.self_mute = self_mute;
    }
}