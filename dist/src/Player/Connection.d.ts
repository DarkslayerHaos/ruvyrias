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
export declare class Connection {
    player: Player;
    region: string | null;
    self_mute: boolean;
    self_deaf: boolean;
    channel_id: string | null;
    session_id: string | null;
    /**
     * The connection class
     * @param player Player
     */
    constructor(player: Player);
    /**
     * Set the voice server update
     * @param {IVoiceServer} data The data from the voice server update
     */
    setServersUpdate(data: IVoiceServer): Promise<void>;
    /**
     * Set the state update
     * @param {SetStateUpdate} data The data from the state update
     */
    setStateUpdate(data: SetStateUpdate): Promise<void>;
}
export {};
