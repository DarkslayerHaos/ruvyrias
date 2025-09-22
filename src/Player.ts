import { ConnectionOptions, ResolveOptions, RuvyriasEvent } from '../types';
import { LoopType, EventHandlerPromise, TrackStuckEvent } from '../types';
import { SpotifyData, SpotifyPublicCredentials } from '../types';
import { LoadTrackResponse } from '../types';
import { Connection } from './Connection';
import { Response } from './Response';
import { Ruvyrias } from './Ruvyrias';
import { EventEmitter } from 'events';
import { Filters } from './Filters';
import { Track } from './Track';
import { Node } from './Node';
import Queue from './Queue';

const escapeRegExp = (str: unknown): string =>
    typeof str === 'string' ? str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : String(str);

/**
 * Represents a music player instance in the Ruvyrias library, managing playback, queue, and voice connection for a guild.
 */
export class Player extends EventEmitter {
    public readonly data: Record<string, unknown>;
    public ruvyrias: Ruvyrias;
    public node: Node;
    public readonly connection: Connection;
    public readonly queue: Queue;
    public readonly filters: Filters;
    public readonly guildId: string;
    public voiceChannelId: string | null;
    public textChannelId: string | null;
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
    public selfMute?: boolean;
    public selfDeaf?: boolean;
    public loop: LoopType;

    constructor(ruvyrias: Ruvyrias, node: Node, options: ConnectionOptions) {
        super();
        this.data = {};
        this.ruvyrias = ruvyrias;
        this.node = node;
        this.connection = new Connection(this);
        this.queue = new Queue(ruvyrias, this);
        this.filters = new Filters(this);
        this.guildId = options.guildId;
        this.voiceChannelId = options.voiceChannelId;
        this.textChannelId = options.textChannelId;
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
        this.selfDeaf = options.selfDeaf ?? false;
        this.selfMute = options.selfMute ?? false;
        this.loop = LoopType.Off;

        this.on(RuvyriasEvent.PlayerUpdate, (packet) => {
            this.isConnected = packet.state.connected;
            this.position = packet.state.position;
            this.ping = packet.state.ping;
            this.timestamp = packet.state.time;
            this.ruvyrias.emit(RuvyriasEvent.PlayerUpdate, this as any);

            try {
                this.currentTrack!.info.position = this.position;
            } catch { }
        });

        (this as any).on('event', (data: EventHandlerPromise) => this.eventHandler(data));
    }

    /**
     * Plays the current or next track in the queue.
     * @returns {Promise<Player | void>} Resolves with the player or void if nothing to play.
     */
    public async play(): Promise<Player | void> {
        if (!this.queue.length) return this;

        this.currentTrack = this.queue.shift() as Track;
        if (this.currentTrack && !this.currentTrack?.encoded) this.currentTrack = await this.resolveTrack(this.currentTrack);

        if (this.currentTrack?.encoded) {
            await this.node.rest.updatePlayer({
                guildId: this.guildId,
                data: {
                    track: { encoded: this.currentTrack.encoded, userData: this.currentTrack.userData },
                },
            });

            this.isPlaying = true;
            this.position = 0;
        }
    }

    /**
     * Stops the player, disconnects from the voice channel, and destroys the player instance.
     * @returns {Promise<boolean | null>} Resolves to true if destroyed, null if nothing to destroy.
     */
    public async stop(): Promise<boolean | null> {
        await this.leaveVoiceChannel();
        await this.node.rest.deletePlayer(this.guildId);
        return this.ruvyrias.destroyPlayer(this.guildId);
    }

    /**
     * Skips the current track.
     * @returns {Promise<Player>} Resolves with the player instance after skipping.
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
     * Pauses playback.
     * @returns {Promise<Player>} Resolves with the player instance after pausing.
     */
    public async pause(): Promise<Player> {
        await this.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { paused: true },
        });

        this.isPlaying = false;
        this.isPaused = true;

        return this;
    }

    /**
     * Resumes playback.
     * @returns {Promise<Player>} Resolves with the player instance after resuming.
     */
    public async resume(): Promise<Player> {
        await this.node.rest.updatePlayer({
            guildId: this.guildId,
            data: { paused: false },
        });

        this.isPlaying = true;
        this.isPaused = false;

        return this;
    }

    /**
     * Connects the player to a voice channel.
     * @param {ConnectionOptions} options - Voice connection options.
     * @returns {void}
     */
    public joinVoiceChannel(options: ConnectionOptions = this): void {
        const { guildId, voiceChannelId, selfDeaf, selfMute } = options;

        this.send({
            guild_id: guildId,
            channel_id: voiceChannelId,
            self_selfDeaf: selfDeaf ?? false,
            self_selfMute: selfMute ?? false,
        });

        this.isConnected = true;
        this.ruvyrias.emit(RuvyriasEvent.Debug, this.guildId, `Ruvyrias -> Player -> The player has been successfully connected.`);
    }

    /**
     * Disconnects the player from the voice channel.
     * @returns {Promise<Player>} Resolves with the player instance after disconnecting.
     */
    public async leaveVoiceChannel(): Promise<Player> {
        if (!this.voiceChannelId) return this;
        await this.pause();

        this.send({
            guild_id: this.guildId,
            channel_id: null,
            self_selfMute: false,
            self_selfDeaf: false,
        });

        this.isConnected = false;
        this.voiceChannelId = null;
        this.ruvyrias.emit(RuvyriasEvent.Debug, this.guildId, `Ruvyrias -> Player -> The player has been successfully disconnected.`);
        return this;
    }

    /**
     * Restarts the player and plays the current track.
     * @returns {Promise<Player | void>} Resolves with the player instance.
     */
    public async restart(): Promise<Player | void> {
        if (!this.currentTrack?.encoded && !this.queue.length) return this;
        if (!this.currentTrack) return this.play();

        await this.node.rest.updatePlayer({
            guildId: this.guildId,
            data: {
                position: this.position,
                track: { encoded: this.currentTrack?.encoded },
                voice: {
                    sessionId: this.connection.session_id,
                    token: this.connection.token,
                    endpoint: this.connection.endpoint,
                }
            },
        });

        return this;
    }

    /**
     * Moves the player to a different Lavalink node.
     * @param {string} name - The target node's name.
     * @returns {Promise<Node | void>} Resolves with the moved node or void.
     */
    public async moveNode(name: string): Promise<Node | void> {
        const availableNodes = Array.from(this.ruvyrias.nodes.values()).filter(node => node.options.name !== name && node.isConnected);

        if (availableNodes.length === 0) {
            throw new Error('No other connected nodes available to move to.');
        }

        const randomNode = availableNodes[Math.floor(Math.random() * availableNodes.length)];

        try {
            await this.node.rest.deletePlayer(this.guildId);
            this.ruvyrias.destroyPlayer(this.guildId);
            this.node = randomNode;
            this.ruvyrias.players.set(this.guildId, this);
            await this.restart();
        } catch (e) {
            await this.stop();
            throw e;
        }
    }

    /**
     * Automatically moves the player to the least used node.
     * @returns {Promise<Node | boolean | void | null>} Resolves with the moved node, false, or null.
     */
    public async autoMoveNode(): Promise<Node | boolean | void | null> {
        if (!this.ruvyrias.leastUsedNodes.length) {
            throw new Error('There are no available nodes currently.');
        }

        const node = this.ruvyrias.nodes.get(this.ruvyrias.leastUsedNodes[0].options?.name as string);
        if (!node) return await this.stop();

        return await this.moveNode(node.name);
    }

    /**
     * Seeks to a specific position in the current track.
     * @param {number} position - The position in milliseconds.
     * @returns {Promise<Player>} Resolves with the player instance.
     */
    public async seek(position: number): Promise<Player> {
        await this.node.rest.updatePlayer({ guildId: this.guildId, data: { position } });
        return this;
    }

    /**
     * Sets the player's volume.
     * @param {number} volume - Volume between 0 and 1000.
     * @returns {Promise<Player>} Resolves with the player instance.
     */
    public async setVolume(volume: number): Promise<Player> {
        if (volume < 0 || volume > 1000) {
            throw new Error('Volume must be between 0 to 1000.');
        }

        await this.node.rest.updatePlayer({ guildId: this.guildId, data: { volume } });
        this.volume = volume;

        return this;
    }

    /**
     * Sets the loop mode for the player.
     * @param {LoopType} mode - The loop mode (off, track, queue).
     * @returns {Player} Resolves with the player instance.
     */
    public setLoop(mode: LoopType): Player {
        if (!mode) {
            throw new Error(`You must have to provide loop mode as argument of setLoopMode.`);
        }

        if (!['off', 'track', 'track'].includes(mode)) throw new Error(`setLoop arguments are off, track and queue.`);

        switch (mode) {
            case 'off': {
                this.loop = LoopType.Off;
                break;
            }
            case 'track': {
                this.loop = LoopType.Track;
                break;
            }
            case 'queue': {
                this.loop = LoopType.Queue;
                break;
            }
        }

        return this;
    }

    /**
     * Stores a key-value pair in the player's data object.
     * @param {string} key - Key name.
     * @param {K} value - Value to store.
     * @template K
     * @returns {void}
     */
    public set<K>(key: string, value: K): void {
        this.data[key] = value;
    }

    /**
     * Retrieves a value by key from the player's data object.
     * @param {string} key - Key name.
     * @template K
     * @returns {K} The stored value.
     */
    public get<K>(key: string): K {
        return this.data[key] as K;
    }

    /**
     * Automatically adds a track to the queue and plays it based on the previous or current track.
     * Supports YouTube and Spotify sources.
     * @param {Player} player - The player instance.
     * @returns {Promise<Player | void>} Resolves with the player instance after autoplay.
     */
    public async autoplay(player: Player): Promise<Player | void> {
        const trackIdentifier = player.previousTrack?.info?.identifier ?? player.currentTrack?.info?.identifier;
        const trackRequester = player.previousTrack?.info?.requester ?? player.currentTrack?.info?.requester;
        const trackSource = player.previousTrack?.info?.sourceName ?? player.currentTrack?.info?.sourceName;

        if (trackSource === 'youtube') {
            try {
                const data = `https://www.youtube.com/watch?v=${trackIdentifier}&list=RD${trackIdentifier}`;

                const response = await this.ruvyrias.search({ query: data, source: 'ytmsearch', requester: trackRequester });
                if (!response || !response.tracks || ['error', 'empty'].includes(response.loadType)) {
                    return await this.skip();
                }

                response.tracks.shift();
                const track = response.tracks[Math.floor(Math.random() * Math.floor(response.tracks.length))];
                this.queue.add(track);
                await this.play();
                return this;
            } catch (e) {
                return await this.skip();
            }
        } else if (trackSource === 'spotify') {
            try {
                const data = await fetch('https://open.spotify.com/get_access_token?reason=transport&productType=embed');
                const body = await data.json() as SpotifyPublicCredentials;

                const res = await fetch(`https://api.spotify.com/v1/recommendations?limit=10&seed_tracks=${trackIdentifier}`, {
                    headers: {
                        'Authorization': `Bearer ${body?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const json = await res.json() as SpotifyData;
                const trackId = json.tracks[Math.floor(Math.random() * json.tracks.length)].id;

                const response = await this.ruvyrias.search({ query: `https://open.spotify.com/track/${trackId}`, source: 'spsearch', requester: trackRequester });
                if (!response || !response.tracks || ['error', 'empty'].includes(response.loadType)) {
                    return await this.skip();
                }

                this.queue.add(response.tracks[0]);
                await this.play();
                return this;
            } catch (e) {
                return await this.skip();
            }
        }
    }

    /**
     * Resolves a track based on its info to find the official or best match.
     * @param {Track} track - The track to resolve.
     * @returns {Promise<Track | null>} Resolves with the resolved track or null if not found.
     * @private
     */
    private async resolveTrack(track: Track): Promise<Track | null> {
        const query = [track.info?.author, track.info?.title].filter((x) => !!x).join(' - ');
        const result = await this.search({ query, source: this.ruvyrias.options?.defaultPlatform ?? 'ytsearch', requester: track.info?.requester });
        if (!result || !result.tracks.length) return null;

        if (track.info?.author) {
            const author = [track.info.author, `${track.info.author} - Topic`];
            const officialAudio = result?.tracks?.find(
                (track: { info: { author: string; title: string; }; }) =>
                    author.some((name) => new RegExp(`^${escapeRegExp(name)}$`, 'i').test(track?.info?.author)) ??
                    new RegExp(`^${escapeRegExp(track?.info?.title)}$`, 'i').test(track?.info?.title)

            );
            if (officialAudio) {
                //track.info.identifier = officialAudio.info.identifier;
                track.encoded = officialAudio.encoded;
                return track;
            }
        }
        if (track.info.length) {
            const sameDuration = result?.tracks?.find(
                (track: Track) =>
                    track?.info?.length >= (track?.info?.length ? track?.info?.length : 0) - 2000 &&
                    track?.info?.length <= (track?.info?.length ? track?.info?.length : 0) + 2000
            );
            if (sameDuration) {
                //track.info.identifier = sameDuration.info.identifier;
                track.encoded = sameDuration.encoded;
                return track;
            }
        }
        try {
            track.info.identifier = result?.tracks[0]?.info?.identifier;
        } catch (e) { };
        return track;
    }

    /**
     * Handles player events such as TrackStartEvent, TrackEndEvent, TrackStuckEvent, and WebSocketClosedEvent.
     * @param {EventHandlerPromise} data - Event data.
     * @returns {Promise<Player | Track | boolean | void>} Resolves depending on the event.
     * @private
     */
    private async eventHandler(data: EventHandlerPromise): Promise<Player | Track | boolean | void> {
        const player = this.ruvyrias.players.get(data.guildId);
        if (!player) return;

        switch (data.type) {
            case 'TrackStartEvent': {
                this.isPlaying = true;
                this.ruvyrias.emit(RuvyriasEvent.TrackStart, this, this.currentTrack as Track);
                break;
            }
            case 'TrackEndEvent': {
                this.previousTrack = this.currentTrack;
                if (['loadFailed', 'cleanup', 'replaced'].includes(data.reason)) {
                    if (this.queue.length === 0 && this.loop === 'off') {
                        this.isPlaying = false;
                        return this.ruvyrias.emit(RuvyriasEvent.QueueEnd, this);
                    } else {
                        this.ruvyrias.emit(RuvyriasEvent.TrackEnd, this, this.currentTrack as Track);
                        return;
                    }
                }

                if (this.loop === 'track' && this.currentTrack!) {
                    this.queue.unshift(this.currentTrack!);
                    this.ruvyrias.emit(RuvyriasEvent.TrackEnd, this, this.currentTrack as Track);
                    return await this.play();
                }

                if (this.loop === 'queue' && this.currentTrack!) {
                    this.queue.push(this.currentTrack!);
                    this.ruvyrias.emit(RuvyriasEvent.TrackEnd, this, this.currentTrack as Track);
                    return await this.play();
                }

                if (this.queue.length === 0) {
                    this.isPlaying = false;
                    return this.ruvyrias.emit(RuvyriasEvent.QueueEnd, this);
                }

                this.isPlaying = false;
                this.currentTrack = null;
                this.ruvyrias.emit(RuvyriasEvent.QueueEnd, this);
                break;
            }

            case 'TrackStuckEvent':
            case 'TrackExceptionEvent': {
                this.ruvyrias.emit(RuvyriasEvent.TrackError, this, data as TrackStuckEvent);
                await this.skip();
                break;
            }
            case 'WebSocketClosedEvent': {
                if ([4015, 4009].includes(data.code)) {
                    this.send({
                        guild_id: data.guildId,
                        channel_id: this.voiceChannelId!,
                        self_selfMute: this.selfMute!,
                        self_selfDeaf: this.selfDeaf!,
                    });
                }
                this.ruvyrias.emit(RuvyriasEvent.SocketClose, this, this.currentTrack!, data);
                this.ruvyrias.emit(RuvyriasEvent.Debug, `Player -> ${this.guildId} -> Player paused due channel deleted or client was kicked.`);
                break;
            }
            default: {
                throw new Error(`An unknown event: ${data}.`);
            }
        }
    }

    /**
     * Resolves a track from a query string using the node's REST API.
     * @param {ResolveOptions} options - Query, source, and requester.
     * @returns {Promise<Response>} Resolves with a Response object containing tracks.
     */
    public async search({ query, source, requester }: ResolveOptions): Promise<Response> {
        const trackIdentifier = /^https?:\/\//.test(query) ? query : `${source ?? 'ytsearch'}:${query}`;
        const response = await this.node.rest.get(`/v4/loadtracks?identifier=${encodeURIComponent(trackIdentifier)}`) as LoadTrackResponse;
        return new Response(response, requester);
    }

    /**
     * Sends voice connection updates to the Ruvyrias instance.
     * @param {{ guild_id: string; channel_id: string | null; self_selfDeaf: boolean; self_selfMute: boolean; }} data - Data to send.
     * @returns {void}
     */
    public send(data: { guild_id: string; channel_id: string | null, self_selfDeaf: boolean; self_selfMute: boolean; }): void {
        if (!this.ruvyrias.send) {
            throw new Error('Please provide a send function in the Ruvyrias options or use one of the supported libraries.')
        }

        this.ruvyrias.send!({ op: 4, d: data });
    }
}