import { Ruvyrias, ResolveOptions } from '../Ruvyrias';
import { Node } from '../Node/Node';
import { Track, TrackData } from '../Guild/Track';
import { Connection } from './Connection';
import Queue from '../Guild/Queue';
import { EventEmitter } from 'events';
import { Filters } from './Filters';
import { LoadTrackResponse, Response } from '../Guild/Response';
import { ConnectionOptions } from '../Ruvyrias';
import { SpotifyData, SpotifyPublicCredentials } from '../../plugins/spotify/Spotify';

const escapeRegExp = (str: string) => {
    try {
        str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    } catch { }
}

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
export class Player extends EventEmitter {
    public readonly data: Record<string, unknown>;
    public ruvyrias: Ruvyrias;
    public node: Node;
    public connection: Connection;
    public queue: Queue;
    public filters: Filters;
    public guildId: string;
    public voiceChannel: string | null;
    public textChannel: string | null;
    public currentTrack: Track | null;
    public previousTrack: Track | null;
    public volume: number;
    public position: number;
    public ping: number;
    public timestamp: number | null;
    public isPlaying: boolean;
    public isPaused: boolean;
    public isConnected: boolean;
    public isAutoPlay: boolean;
    public isQuietMode: boolean;
    public mute?: boolean;
    public deaf?: boolean;
    public loop: Loop;

    constructor(ruvyrias: Ruvyrias, node: Node, options: ConnectionOptions) {
        super();
        this.data = {};
        this.ruvyrias = ruvyrias;
        this.node = node;
        this.connection = new Connection(this);
        this.queue = new Queue();
        this.filters = new Filters(this);
        this.guildId = options.guildId;
        this.voiceChannel = options.voiceChannel;
        this.textChannel = options.textChannel;
        this.currentTrack = null;
        this.previousTrack = null;
        this.volume = 100;
        this.position = 0;
        this.ping = 0;
        this.timestamp = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.isConnected = false;
        this.isAutoPlay = false;
        this.isQuietMode = false;
        this.deaf = options.deaf ?? false;
        this.mute = options.mute ?? false;
        this.loop = 'NONE';

        this.ruvyrias.emit('playerCreate', this);
        this.on('playerUpdate', (packet) => {
            this.isConnected = packet.state.connected;
            this.position = packet.state.position;
            this.ping = packet.state.ping;
            this.timestamp = packet.state.time;
            //this event will be useful for creating web player
            this.ruvyrias.emit('playerUpdate', this);

            try {
                this.currentTrack!.info.position = this.position;
            } catch { }
        });
        
        this.on('event', data => this.eventHandler(data));
    }

    /**
     * Plays the current or next track in the queue.
     * @returns {Promise<Player>} - A promise that resolves to the player or the next track to play.
     */
    public async play(): Promise<Player | void> {
        if (!this.queue.length) return this;

        this.currentTrack = this.queue.shift() as Track;
        if (this.currentTrack && !this.currentTrack?.track) this.currentTrack = await this.resolveTrack(this.currentTrack);

        if (this.currentTrack?.track) {
            await this.node.rest.updatePlayer({
                guildId: this.guildId,
                data: {
                    track: { encoded: this.currentTrack.track, userData: this.currentTrack.userData },
                },
            });

            this.isPlaying = true;
            this.position = 0;
        }
    }

    /**
     * Stops the player, disconnects from the voice channel, and destroys the player instance.
     * @returns {Promise<boolean>} - A promise that resolves to true once the player is destroyed.
     */
    public async stop(): Promise<boolean> {
        await this.disconnect();
        this.node.rest.destroyPlayer(this.guildId);
        this.ruvyrias.emit('debug', this.guildId, `[Ruvyrias Player] destroyed the player`);
        this.ruvyrias.emit('playerDestroy', this);

        return this.ruvyrias.players.delete(this.guildId);
    }

    /**
     * Skips the current track.
     * @returns {Promise<Player>} - The player instance after skipping the track.
     */
    public async skip(): Promise<Player> {
        this.position = 0;
        this.isPlaying = false;

        await this.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { track: { encoded: null } },
        });

        return this;
    }

    /**
     * Pauses or resumes the player.
     * @param {boolean} toggle - Boolean to pause or resume the player.
     * @returns {Promise<Player>} - The player instance after pausing or resuming.
     */
    public async pause(toggle: boolean = true): Promise<Player> {
        await this.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { paused: toggle },
        });

        this.isPlaying = !toggle;
        this.isPaused = toggle;

        return this;
    }

    /**
     * This function will restart the player and play the current track
     * @returns {Promise<Player>} Returns a Player object
     */
    public async restart(): Promise<Player | void> {
        if (!this.currentTrack?.track && !this.queue.length) return this;
        if (!this.currentTrack) return this.play();

        await this.node.rest.updatePlayer({
            guildId: this.guildId,
            data: {
                position: this.position,
                track: this.currentTrack,
            },
        });

        return this;
    }

    /**
     * Connects the player to a voice channel using the provided connection options.
     * If no options are specified, it uses the default values from the player.
     * @param {ConnectionOptions} options - The connection options, including guildId, voiceChannel, deaf, and mute settings.
     * @returns {void}
     */
    public connect(options: ConnectionOptions = this): void {
        const { guildId, voiceChannel, deaf, mute } = options;

        this.send({
            guild_id: guildId,
            channel_id: voiceChannel,
            self_deaf: deaf ?? false,
            self_mute: mute ?? false,
        });

        this.isConnected = true;
        this.ruvyrias.emit('debug', this.guildId, `[Ruvyrias Player] Player has been connected`);
    }

    /**
     * Disconnects the player from the voice channel.
     * @returns {Promise<Player>} A promise that resolves to the player instance if disconnection is successful.
     */
    public async disconnect(): Promise<Player> {
        if (!this.voiceChannel) return this;
        await this.pause(true);
        this.isConnected = false;
        this.voiceChannel = null;

        this.send({
            guild_id: this.guildId,
            channel_id: null,
            self_mute: false,
            self_deaf: false,
        });

        return this;
    }

    /**
     * Seeks to the specified position in the currently playing track.
     * @param {number} position - The position to seek to.
     * @returns {Promise<Player>} A promise that resolves once the seek operation is complete.
     */
    public async seekTo(position: number): Promise<Player> {
        if (this.position + position >= (this.currentTrack as Track).info.length) {
            position = (this.currentTrack as Track).info.length;
        }

        await this.node.rest.updatePlayer({ guildId: this.guildId, data: { position } });

        return this;
    }

    /**
     * @param volume Number to set the volume
     * @returns {Player} To set the volume
     */
    public async setVolume(volume: number): Promise<Player> {
        if (volume < 0 ?? volume > 1000) {
            throw new Error('[Ruvyrias Exception] Volume must be between 0 to 1000');
        }

        await this.node.rest.updatePlayer({ guildId: this.guildId, data: { volume } });
        this.volume = volume;

        return this;
    }

    /**
     * Sets the loop mode for the player.
     * @param {Loop} mode - The loop mode to be set (NONE, TRACK, QUEUE).
     * @returns {Player} - The player instance with the updated loop mode.
     */
    public setLoop(mode: Loop): Player {
        if (!mode) {
            throw new Error(`[Ruvyrias Player] You must have to provide loop mode as argument of setLoop`);
        }

        if (!['NONE', 'TRACK', 'QUEUE'].includes(mode)) throw new Error(`[Ruvyrias Player] setLoop arguments are NONE,TRACK AND QUEUE`);

        switch (mode) {
            case 'NONE': {
                this.loop = 'NONE';
                break;
            }
            case 'TRACK': {
                this.loop = 'TRACK';
                break;
            }
            case 'QUEUE': {
                this.loop = 'QUEUE';
                break;
            }
            default: {
                this.loop = 'NONE';
            }
        }

        return this;
    }

    /**
     * Sets the text channel for the player.
     * @param {string} channel - The ID or name of the text channel to be set.
     * @returns {Player} - The player instance with the updated text channel.
     */
    public setTextChannel(channel: string): Player {
        this.textChannel = channel;
        return this;
    }

    /**
     * Sets the voice channel for the player.
     * @param {string} channel - The ID or name of the voice channel to be set.
     * @param {Object} options - Optional parameters for mute and deaf settings.
     * @param {boolean} options.mute - Whether the player should be muted in the new voice channel. Defaults to false.
     * @param {boolean} options.deaf - Whether the player should be deafened in the new voice channel. Defaults to false.
     * @returns {Player} - The player instance with the updated voice channel settings.
     */
    public setVoiceChannel(channel: string, options?: { mute: boolean; deaf: boolean }): Player {
        if (this.isConnected && channel == this.voiceChannel) {
            throw new ReferenceError(`Player is already connected to ${channel}`);
        }

        this.voiceChannel = channel;

        if (options) {
            this.mute = options.mute ?? this.mute ?? false;
            this.deaf = options.deaf ?? this.deaf ?? false;
        }

        this.connect({
            deaf: this.deaf,
            guildId: this.guildId,
            voiceChannel: this.voiceChannel,
            textChannel: this.textChannel,
            mute: this.mute,
        });

        return this;
    }

    /**
     * Moves the player to a different lavalink node.
     * @param {string} name - The name of the node to move to.
     * @returns {Promise<Node | void>} - A Promise that resolves once the player has been successfully moved to the specified node.
     */
    public async moveNode(name: string): Promise<Node | void> {
        const node = this.ruvyrias.nodes.get(name) as Node;

        if (!node ?? (node && node.name === this.node.name)) return;
        if (!node.isConnected) {
            throw new Error('Provided Node is not connected');
        }

        try {
            await this.node.rest.destroyPlayer(this.guildId);
            this.ruvyrias.players.delete(this.guildId);
            this.node = node;
            this.ruvyrias.players.set(this.guildId, this);
            await this.restart();
        } catch (e) {
            await this.stop();
            throw e;
        }
    }

    /**
     * Automatically moves the player to the least used Lavalink node.
     * @returns {Promise<Node | boolean | void>} Resolves with the moved Node or false, or if an error occurred.
     */
    public async autoMoveNode(): Promise<Node | boolean | void> {
        if (!this.ruvyrias.leastUsedNodes.length) {
            throw new Error('[Ruvyrias Error] No nodes are available');
        }

        const node = this.ruvyrias.nodes.get(this.ruvyrias.leastUsedNodes[0].name);
        if (!node) return await this.stop();

        return await this.moveNode(node.name);
    }

    /**
     * Sets the provided value for the given key.
     * @param {string} key - The key to set the value.
     * @param {unknown} value - The value to set for the key.
     * @returns {void} - void
     */
    public set<K>(key: string, value: K): void {
        this.data[key] = value;
    }

    /**
     * Retrieves the value associated with the provided key.
     * @param {string} key - The key to get the value.
     * @returns {K} The value associated with the key.
     * @template K - The type of the value associated with the key.
     */
    public get<K>(key: string): K {
        return this.data[key] as K;
    }

    /**
     * Automatically adds a track to the queue and plays it based on the previous or current track.
     * @param {Player} player - The player instance.
     * @returns {Promise<Player>} - The updated player instance playing the new song.
     */
    public async autoplay(player: Player): Promise<Player | void> {
        if (!player ?? !player.isAutoPlay) {
            return this;
        }

        const trackIdentifier = player.previousTrack?.info?.identifier ?? player.currentTrack?.info?.identifier;
        const trackRequester = player.previousTrack?.info?.requester ?? player.currentTrack?.info?.requester;
        const trackSource = player.previousTrack?.info?.sourceName ?? player.currentTrack?.info?.sourceName;

        if (trackSource === 'youtube') {
            try {
                const data = `https://www.youtube.com/watch?v=${trackIdentifier}&list=RD${trackIdentifier}`;

                const response = await this.ruvyrias.resolve({ query: data, source: 'ytmsearch', requester: trackRequester });
                if (!response ?? !response.tracks ?? ['error', 'empty'].includes(response.loadType)) {
                    return await this.skip();
                }

                response.tracks.shift();

                const track = response.tracks[Math.floor(Math.random() * Math.floor(response.tracks.length))];
                this.queue.add(track);

                return this;
            } catch (e) {
                return await this.skip();
            }
        } else if (trackSource === 'spotify') {
            try {
                const data = await fetch("https://open.spotify.com/get_access_token?reason=transport&productType=embed");
                const body = await data.json() as SpotifyPublicCredentials;

                const res = await fetch(`https://api.spotify.com/v1/recommendations?limit=10&seed_tracks=${trackIdentifier}`, {
                    headers: {
                        'Authorization': `Bearer ${body?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const json = await res.json() as SpotifyData;
                const trackId = json.tracks[Math.floor(Math.random() * json.tracks.length)].id;

                const response = await this.ruvyrias.resolve({ query: `https://open.spotify.com/track/${trackId}`, source: 'spsearch', requester: trackRequester });
                if (!response ?? !response.tracks ?? ['error', 'empty'].includes(response.loadType)) {
                    return await this.skip();
                }

                this.queue.add(response.tracks[0]);

                return this;
            } catch (e) {
                return await this.skip();
            }
        }
    }

    /**
     * Resolves a track based on the provided Track instance.
     * @param {Track} track - The track to be resolved.
     * @returns {Promise<Track>} - The resolved track.
     * @private
     */
    private async resolveTrack(track: Track): Promise<Track | null> {
        const query = [track.info?.author, track.info?.title].filter((x) => !!x).join(' - ');
        const result = await this.resolve({ query, source: this.ruvyrias.options?.defaultPlatform ?? 'ytsearch', requester: track.info?.requester });
        if (!result ?? !result.tracks.length) return null;

        if (track.info?.author) {
            const author = [track.info.author, `${track.info.author} - Topic`];
            const officialAudio = result?.tracks?.find(
                (track: { info: { author: string; title: string; }; }) =>
                    author.some((name) => new RegExp(`^${escapeRegExp(name)}$`, 'i').test(track?.info?.author)) ??
                    new RegExp(`^${escapeRegExp(track?.info?.title)}$`, 'i').test(track?.info?.title)

            );
            if (officialAudio) {
                //track.info.identifier = officialAudio.info.identifier;
                track.track = officialAudio.track;
                return track;
            }
        }
        if (track.info.length) {
            const sameDuration = result?.tracks?.find(
                (track: TrackData) =>
                    track?.info?.length >= (track?.info?.length ? track?.info?.length : 0) - 2000 &&
                    track?.info?.length <= (track?.info?.length ? track?.info?.length : 0) + 2000
            );
            if (sameDuration) {
                //track.info.identifier = sameDuration.info.identifier;
                track.track = sameDuration.track;
                return track;
            }
        }
        try {
            track.info.identifier = result?.tracks[0]?.info?.identifier;
        } catch (e) { };
        return track;
    }

    /**
     * This function will handle all the events
     * @param {EventHandlerPromise} data The data of the event
     * @returns {Promise<boolean | void | Player | Track>} The Player object, a boolean or void
     */
    public async eventHandler(data: EventHandlerPromise): Promise<Player | Track | boolean | void> {
        const player = this.ruvyrias.players.get(data.guildId);
        if (!player) return;

        switch (data.type) {
            case 'TrackStartEvent': {
                this.isPlaying = true;
                this.ruvyrias.emit('trackStart', this, this.currentTrack!, data);
                break;
            }
            case 'TrackEndEvent': {
                this.previousTrack = this.currentTrack;
                if (this.loop === 'TRACK') {
                    this.queue.unshift(this.previousTrack!);
                    this.ruvyrias.emit('trackEnd', this, this.currentTrack!, data);
                    return await this.play();
                } else if (this.currentTrack && this.loop === 'QUEUE') {
                    this.queue.push(this.previousTrack!);
                    this.ruvyrias.emit('trackEnd', this, this.currentTrack!, data);
                    return await this.play();
                }

                if (this.queue.length === 0) {
                    this.isPlaying = false;
                    return this.ruvyrias.emit('queueEnd', this);
                } else if (this.queue.length > 0) {
                    this.ruvyrias.emit('trackEnd', this, this.currentTrack!, data);
                    return await this.play();
                }

                this.isPlaying = false;
                this.ruvyrias.emit('queueEnd', this);
                break;
            }

            case 'TrackStuckEvent':
            case 'TrackExceptionEvent': {
                this.ruvyrias.emit('trackError', this, this.currentTrack!, data as TrackStuckEvent);
                await this.skip();
                break;
            }
            case 'WebSocketClosedEvent': {
                if ([4015, 4009].includes(data.code)) {
                    this.send({
                        guild_id: data.guildId,
                        channel_id: this.voiceChannel!,
                        self_mute: this.mute!,
                        self_deaf: this.deaf!,
                    });
                }
                this.ruvyrias.emit('socketClose', this, this.currentTrack!, data);
                await this.pause(true);
                this.ruvyrias.emit(
                    'debug',
                    `Player -> ${this.guildId}`,
                    'Player paused Cause Channel deleted Or Client was kicked'
                );
                break;
            }
            default: {
                throw new Error(`An unknown event: ${data}`);
            }
        }
    }

    /**
     * Resolves a track based on the provided query, source, and requester information.
     * @param {ResolveOptions} options - The options for resolving a track.
     * @returns {Promise<Response>} - The response containing information about the resolved track.
     */
    public async resolve({ query, source, requester }: ResolveOptions): Promise<Response> {
        const trackIdentifier = /^https?:\/\//.test(query) ? query : `${source ?? 'ytsearch'}:${query}`;
        const response = await this.node.rest.get(`/v4/loadtracks?identifier=${encodeURIComponent(trackIdentifier)}`) as LoadTrackResponse;
        return new Response(response, requester);
    }

    /**
     * Sends data to the Ruvyrias instance.
     * @param {object} data - The data to be sent, including guild_id, channel_id, self_deaf, self_mute.
     * @returns {void} - void
     */
    public send(data: { guild_id: string; channel_id: string | null, self_deaf: boolean; self_mute: boolean; }): void {
        (this.ruvyrias as any).send({ op: 4, d: data });
    }
}