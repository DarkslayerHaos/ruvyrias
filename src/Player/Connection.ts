import { Player } from './Player';

/**
 * Interface representing the data received in a voice server update.
 */
export interface IVoiceServer {
    /** The authentication token for the voice server connection. */
    token: string;
    /** The session ID for the voice server connection. */
    sessionId: string;
    /** The endpoint URL for the voice server connection. */
    endpoint?: string;
}

/** Type representing a four-digit year. */
type TYear = `${number}${number}${number}${number}`;
/** Type representing a two-digit month. */
type TMonth = `${number}${number}`;
/** Type representing a two-digit day. */
type TDay = `${number}${number}`;
/** Type representing a two-digit hour. */
type THours = `${number}${number}`;
/** Type representing a two-digit minute. */
type TMinutes = `${number}${number}`;
/** Type representing a two-digit second. */
type TSeconds = `${number}${number}`;
/** Type representing a three-digit millisecond. */
type TMilliseconds = `${number}${number}${number}`;
/** Type representing a date in ISO format (YYYY-MM-DD). */
type TDateISODate = `${TYear}-${TMonth}-${TDay}`;
/** Type representing a time in ISO format (HH:mm:ss.SSS). */
type TDateISOTime = `${THours}:${TMinutes}:${TSeconds}.${TMilliseconds}`;
/** Type representing a full date and time in ISO format (YYYY-MM-DDTHH:mm:ss.SSSZ). */
type TDateISO = `${TDateISODate}T${TDateISOTime}Z`;

/**
 * Represents the data structure of a Discord voice state update.
 * @reference https://discord.com/developers/docs/resources/voice#voice-state-object
 */
export interface SetStateUpdate {
    /** The ID of the guild. */
    guild_id?: string;
    /** The ID of the channel. */
    channel_id: string;
    /** The ID of the user. */
    user_id: string;
    /** The member object, if available. */
    member?: Record<string, unknown>;
    /** The session ID. */
    session_id: string;
    /** Whether the user is deafened. */
    deaf: boolean;
    /** Whether the user is muted. */
    mute: boolean;
    /** Whether the user is self-deafened. */
    self_deaf: boolean;
    /** Whether the user is self-muted. */
    self_mute: boolean;
    /** Whether the user is streaming. */
    self_stream?: boolean;
    /** Whether the user is using video. */
    self_video: boolean;
    /** Whether the user is suppressed. */
    suppress: boolean;
    /** The timestamp for the user's request to speak. */
    request_to_speak_timestamp?: TDateISO;
}

/**
 * Manages the connection between the player and an external source.
 */
export class Connection {
    public player: Player;
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
     * Set the voice server update
     * @param {IVoiceServer} data The data from the voice server update
     */
    public async setServersUpdate(data: IVoiceServer): Promise<void> {
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
                },
            },
        });

        this.player.ruvyrias.emit(
            'debug',
            this.player.node.options.name,
            `[Voice] <- [Discord]: Voice Server Update | Server: ${this.region} Guild: ${this.player.guildId}.`
        );
    }

    /**
     * Set the state update
     * @param {SetStateUpdate} data The data from the state update
     */
    public async setStateUpdate(data: SetStateUpdate): Promise<void> {
        const { session_id, channel_id, self_deaf, self_mute } = data;

        if (channel_id == null) {
            this.player.stop();
        }

        if (this.player.voiceChannel && channel_id && this.player.voiceChannel !== channel_id) {
            this.player.voiceChannel = channel_id;
        }

        this.channel_id = channel_id;
        this.session_id = session_id;
        this.self_deaf = self_deaf;
        this.self_mute = self_mute;
    }
}
