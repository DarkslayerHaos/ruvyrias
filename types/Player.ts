import { Track } from '../src/Track';

/**
 * Reasons for a track to end.
 */
export type TrackEndReason = 'finished' | 'loadFailed' | 'stopped' | 'replaced' | 'cleanup';

/**
 * Types of events emitted by the player.
 */
export enum PlayerEventsType {
    TrackStartEvent = 'TrackStartEvent',
    TrackEndEvent = 'TrackEndEvent',
    TrackExceptionEvent = 'TrackExceptionEvent',
    TrackStuckEvent = 'TrackStuckEvent',
    WebsocketClosedEvent = 'WebSocketClosedEvent'
}

/**
 * Types of events emitted by the player that the function eventHandle can handle.
 */
export type EventHandlerPromise = TrackStartEvent | TrackEndEvent | TrackStuckEvent | TrackExceptionEvent | WebSocketClosedEvent;

/**
 * Represents an event related to the player.
 */
export interface LavalinkPlayerEvents {
    op: 'event';
    type: PlayerEventsType;
    guildId: string;
}

/**
 * Represents the event when a track starts playing in the player.
 */
export interface TrackStartEvent extends LavalinkPlayerEvents {
    type: PlayerEventsType.TrackStartEvent;
    track: Track;
}

/**
 * Represents the event when a track finishes playing in the player.
 */
export interface TrackEndEvent extends LavalinkPlayerEvents {
    type: PlayerEventsType.TrackEndEvent;
    track: Track;
    reason: TrackEndReason;
}

/**
 * Represents the event when a track gets stuck while playing in the player.
 */
export interface TrackStuckEvent extends LavalinkPlayerEvents {
    type: PlayerEventsType.TrackStuckEvent;
    track: Track;
    thresholdMs: number;
}

/**
 * Represents the event when an exception occurs while playing a track in the player.
 */
export interface TrackExceptionEvent extends LavalinkPlayerEvents {
    type: PlayerEventsType.TrackExceptionEvent;
    exception: any;
}

/**
 * Represents the event when the WebSocket connection to Discord voice servers is closed.
 */
export interface WebSocketClosedEvent extends LavalinkPlayerEvents {
    type: PlayerEventsType.WebsocketClosedEvent;
    code: number;
    byRemote: boolean;
    reason: string;
}

export interface LavalinkPlayer {
    guildId: string;
    track?: Track;
    volume: number;
    paused: boolean;
    voice: any;
    filters: Partial<any>;
    state: {
        time: number;
        position: number;
        connected: boolean;
        ping: number;
    }
}

/**
 * Loop modes available for the player.
 */
export enum LoopType {
    /** Disable looping. */
    Off = 'off',
    /** Loop the current track. */
    Track = 'track',
    /** Loop the entire queue. */
    Queue = 'queue',
}