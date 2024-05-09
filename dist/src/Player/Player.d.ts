/// <reference types="node" />
import { Ruvyrias, ResolveOptions } from '../Ruvyrias';
import { Node } from '../Node/Node';
import { Track } from '../Guild/Track';
import { Connection } from './Connection';
import Queue from '../Guild/Queue';
import { EventEmitter } from 'events';
import { Filters } from './Filters';
import { Response } from '../Guild/Response';
import { ConnectionOptions } from '../Ruvyrias';
/**
 * Loop mode options for the player.
 */
export type Loop = 'NONE' | 'TRACK' | 'QUEUE';
/**
 * Reasons for a track to end.
 */
export type TrackEndReason = 'finished' | 'loadFailed' | 'stopped' | 'replaced' | 'cleanup';
/**
 * Types of events emitted by the player.
 */
export type PlayerEventType = 'TrackStartEvent' | 'TrackEndEvent' | 'TrackExceptionEvent' | 'TrackStuckEvent' | 'WebSocketClosedEvent';
/**
 * Types of events emitted by the player that the function eventHandle can handle.
 */
export type EventHandlerPromise = TrackStartEvent | TrackEndEvent | TrackStuckEvent | TrackExceptionEvent | WebSocketClosedEvent;
/**
 * Represents an event related to the player.
 */
export interface PlayerEvent {
    /** The operation identifier, always set to 'event'. */
    op: 'event';
    /** The type of the player event. */
    type: PlayerEventType;
    /** The unique identifier of the guild where the player event occurred. */
    guildId: string;
}
/**
 * Represents the event when a track starts playing in the player.
 */
export interface TrackStartEvent extends PlayerEvent {
    /** The type of the player event, set to 'TrackStartEvent'. */
    type: 'TrackStartEvent';
    /** The track that has started playing. */
    track: Track;
}
/**
 * Represents the event when a track finishes playing in the player.
 */
export interface TrackEndEvent extends PlayerEvent {
    /** The type of the player event, set to 'TrackEndEvent'. */
    type: 'TrackEndEvent';
    /** The track that has ended. */
    track: Track;
    /** The reason for the track ending. */
    reason: TrackEndReason;
}
/**
 * Represents the event when a track gets stuck while playing in the player.
 */
export interface TrackStuckEvent extends PlayerEvent {
    /** The type of the player event, set to 'TrackStuckEvent'. */
    type: 'TrackStuckEvent';
    /** The track that is stuck. */
    track: Track;
    /** The threshold duration (in milliseconds) for considering a track as stuck. */
    thresholdMs: number;
}
/**
 * Represents the event when an exception occurs while playing a track in the player.
 */
export interface TrackExceptionEvent extends PlayerEvent {
    /** The type of the player event, set to 'TrackExceptionEvent'. */
    type: 'TrackExceptionEvent';
    /** The exception details when an error occurs during track playback. */
    exception: any;
}
/**
 * Represents the event when the WebSocket connection to Discord voice servers is closed.
 */
export interface WebSocketClosedEvent extends PlayerEvent {
    /** The type of the player event, set to 'WebSocketClosedEvent'. */
    type: 'WebSocketClosedEvent';
    /** The WebSocket close code. */
    code: number;
    /** Indicates whether the connection was closed by the remote (Discord) side. */
    byRemote: boolean;
    /** The reason for closing the WebSocket connection. */
    reason: string;
}
/**
 * Represents a player instance in the Ruvyrias music library.
 * Manages the playback, queue, and connection for a specific guild.
 */
export declare class Player extends EventEmitter {
    readonly data: Record<string, unknown>;
    ruvyrias: Ruvyrias;
    node: Node;
    connection: Connection;
    queue: Queue;
    filters: Filters;
    guildId: string;
    voiceChannel: string | null;
    textChannel: string | null;
    currentTrack: Track | null;
    previousTrack: Track | null;
    volume: number;
    position: number;
    ping: number;
    timestamp: number | null;
    isPlaying: boolean;
    isPaused: boolean;
    isConnected: boolean;
    isAutoPlay: boolean;
    isQuietMode: boolean;
    mute?: boolean;
    deaf?: boolean;
    loop: Loop;
    constructor(ruvyrias: Ruvyrias, node: Node, options: ConnectionOptions);
    /**
     * Plays the current or next track in the queue.
     * @returns {Promise<Player>} - A promise that resolves to the player or the next track to play.
     */
    play(): Promise<Player | void>;
    /**
     * Stops the player, disconnects from the voice channel, and destroys the player instance.
     * @returns {Promise<boolean|null>} - A promise that resolves to true once the player is destroyed.
     */
    stop(): Promise<boolean | null>;
    /**
     * Skips the current track.
     * @returns {Promise<Player>} - The player instance after skipping the track.
     */
    skip(): Promise<Player>;
    /**
     * Pauses or resumes the player.
     * @param {boolean} toggle - Boolean to pause or resume the player.
     * @returns {Promise<Player>} - The player instance after pausing or resuming.
     */
    pause(toggle?: boolean): Promise<Player>;
    /**
     * Connects the player to a voice channel using the provided connection options.
     * If no options are specified, it uses the default values from the player.
     * @param {ConnectionOptions} options - The connection options, including guildId, voiceChannel, deaf, and mute settings.
     * @returns {void}
     */
    connect(options?: ConnectionOptions): void;
    /**
     * Disconnects the player from the voice channel.
     * @returns {Promise<Player>} A promise that resolves to the player instance if disconnection is successful.
     */
    disconnect(): Promise<Player>;
    /**
     * This function will restart the player and play the current track
     * @returns {Promise<Player|void>} Returns a Player object
     */
    restart(): Promise<Player | void>;
    /**
     * Moves the player to a different lavalink node.
     * @param {string} name - The name of the node to move to.
     * @returns {Promise<Node | void>} - A Promise that resolves once the player has been successfully moved to the specified node.
     */
    moveNode(name: string): Promise<Node | void>;
    /**
     * Automatically moves the player to the least used Lavalink node.
     * @returns {Promise<Node | boolean | void | null>} Resolves with the moved Node or false, or if an error occurred.
     */
    autoMoveNode(): Promise<Node | boolean | void | null>;
    /**
     * Seeks to the specified position in the currently playing track.
     * @param {number} position - The position to seek to.
     * @returns {Promise<Player>} A promise that resolves once the seek operation is complete.
     */
    seekTo(position: number): Promise<Player>;
    /**
     * @param volume Number to set the volume
     * @returns {Player} To set the volume
     */
    setVolume(volume: number): Promise<Player>;
    /**
     * Sets the loop mode for the player.
     * @param {Loop} mode - The loop mode to be set (NONE, TRACK, QUEUE).
     * @returns {Player} - The player instance with the updated loop mode.
     */
    setLoop(mode: Loop): Player;
    /**
     * Sets the text channel for the player.
     * @param {string} channel - The ID or name of the text channel to be set.
     * @returns {Player} - The player instance with the updated text channel.
     */
    setTextChannel(channel: string): Player;
    /**
     * Sets the voice channel for the player.
     * @param {string} channel - The ID or name of the voice channel to be set.
     * @param {Object} options - Optional parameters for mute and deaf settings.
     * @param {boolean} options.mute - Whether the player should be muted in the new voice channel. Defaults to false.
     * @param {boolean} options.deaf - Whether the player should be deafened in the new voice channel. Defaults to false.
     * @returns {Player} - The player instance with the updated voice channel settings.
     */
    setVoiceChannel(channel: string, options?: {
        mute: boolean;
        deaf: boolean;
    }): Player;
    /**
     * Sets the provided value for the given key.
     * @param {string} key - The key to set the value.
     * @param {unknown} value - The value to set for the key.
     * @returns {void} - void
     */
    set<K>(key: string, value: K): void;
    /**
     * Retrieves the value associated with the provided key.
     * @param {string} key - The key to get the value.
     * @returns {K} The value associated with the key.
     * @template K - The type of the value associated with the key.
     */
    get<K>(key: string): K;
    /**
     * Automatically adds a track to the queue and plays it based on the previous or current track.
     * @param {Player} player - The player instance.
     * @returns {Promise<Player>} - The updated player instance playing the new song.
     */
    autoplay(player: Player): Promise<Player | void>;
    /**
     * Resolves a track based on the provided Track instance.
     * @param {Track} track - The track to be resolved.
     * @returns {Promise<Track>} - The resolved track.
     * @private
     */
    private resolveTrack;
    /**
     * This function will handle all the events
     * @param {EventHandlerPromise} data The data of the event
     * @returns {Promise<boolean | void | Player | Track>} The Player object, a boolean or void
     */
    eventHandler(data: EventHandlerPromise): Promise<Player | Track | boolean | void>;
    /**
     * Resolves a track based on the provided query, source, and requester information.
     * @param {ResolveOptions} options - The options for resolving a track.
     * @returns {Promise<Response>} - The response containing information about the resolved track.
     */
    resolve({ query, source, requester }: ResolveOptions): Promise<Response>;
    /**
     * Sends data to the Ruvyrias instance.
     * @param {object} data - The data to be sent, including guild_id, channel_id, self_deaf, self_mute.
     * @returns {void} - void
     */
    send(data: {
        guild_id: string;
        channel_id: string | null;
        self_deaf: boolean;
        self_mute: boolean;
    }): void;
}
