import { RuvyriasEvent } from '../types';
import { Player } from './Player';
import { Ruvyrias } from './Ruvyrias';
import { Track } from './Track';

/**
 * Represents a queue of tracks in a player, extending Array with helper methods for managing tracks.
 */
export default class Queue extends Array<Track> {
    public readonly player: Player;
    public readonly ruvyrias: Ruvyrias;

    constructor(ruvyrias: Ruvyrias, player: Player) {
        super();
        this.player = player;
        this.ruvyrias = ruvyrias;
    }

    /**
     * Gets the number of tracks in the queue.
     * @returns {number} - The total number of tracks.
     */
    public get size(): number {
        return this.length;
    }

    /**
     * Returns the first track in the queue.
     * @returns {Track | undefined} - The first track, or undefined if empty.
     */
    public first(): Track | undefined {
        return this[0];
    }

    /**
     * Adds a track to the queue.
     * @param {Track} track - Track to add.
     * @returns {Queue} - The queue instance.
     */
    public add(track: Track): Queue {
        this.push(track);
        this.ruvyrias.emit(RuvyriasEvent.QueueAdd, this.player, track);
        return this;
    }

    /**
     * Removes a track from the queue by index.
     * @param {number} index - Zero-based index of the track.
     * @returns {Track | undefined} - The removed track or undefined if index invalid.
     */
    public remove(index: number): Track | undefined {
        this.ruvyrias.emit(RuvyriasEvent.QueueRemove, this.player, index as unknown as Track);
        return super.splice(index, 1)[0];
    }

    /**
     * Clears all tracks from the queue.
     * @returns {Track[]} - All removed tracks or empty array.
     */
    public clear(): Track[] | [] {
        return super.splice(0);
    }

    /**
     * Shuffles the queue randomly in place.
     */
    public shuffle(): void {
        for (let i = this.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
    }

    /**
     * Removes duplicate tracks based on their encoded URI.
     * @returns {boolean} - True if duplicates were removed, false otherwise.
     */
    public removeDuplicates(): boolean {
        if (this.length < 2) return false;

        const uniqueTracks: Track[] = [];
        const seenUris: Set<string> = new Set();

        for (const track of this) {
            if (!seenUris.has(track.info.uri)) {
                uniqueTracks.push(track);
                seenUris.add(track.info.uri);
            }
        }

        if (uniqueTracks.length === this.length) return false;

        this.splice(0, this.length, ...uniqueTracks);
        return true;
    }

    /**
     * Jumps to a specific position in the queue by removing all tracks before it.
     * @param {number} position - 1-based position in the queue.
     * @returns {boolean} - True if jump succeeded, false if position invalid.
     */
    public jump(position: number): boolean {
        if (!position || isNaN(position) || position < 1 || position > this.length) return false;

        const skipped = this.splice(0, position - 1);
        skipped.forEach(track => this.ruvyrias.emit(RuvyriasEvent.QueueRemove, this.player, track));

        return true;
    }
}