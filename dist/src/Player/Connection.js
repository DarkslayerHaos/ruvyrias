"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
/**
 * Manages the connection between the player and an external source.
 */
class Connection {
    player;
    region;
    self_mute;
    self_deaf;
    channel_id;
    session_id;
    token;
    endpoint;
    /**
     * The connection class
     * @param player Player
     */
    constructor(player) {
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
     * Set the voice server update
     * @param {IVoiceServer} data The data from the voice server update
     */
    async setServersUpdate(data) {
        if (!data.endpoint) {
            throw new Error('[Ruvyrias Error] No Session ID found.');
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
        this.player.ruvyrias.emit('debug', this.player.node.name, `[Voice] <- [Discord]: Voice Server Update | Server: ${this.region} Guild: ${this.player.guildId}.`);
    }
    /**
     * Set the state update
     * @param {SetStateUpdate} data The data from the state update
     */
    async setStateUpdate(data) {
        const { session_id, channel_id, self_deaf, self_mute } = data;
        if (channel_id == null) {
            this.player.stop();
        }
        if (this.player.voiceChannel &&
            channel_id &&
            this.player.voiceChannel !== channel_id) {
            this.player.voiceChannel = channel_id;
        }
        this.channel_id = channel_id;
        this.session_id = session_id;
        this.self_deaf = self_deaf;
        this.self_mute = self_mute;
    }
}
exports.Connection = Connection;
