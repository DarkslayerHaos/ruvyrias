import { Track } from './Track';

/**
 * Represents a queue of tracks in the player. Extends the Array class with additional methods.
 */
export default class Queue extends Array<Track> {
    constructor() {
        super(...arguments);
    }

    /**
     * Gets the number of tracks in the queue.
     * @returns {number} - The number of tracks in the queue.
     */
    public get size(): number {
        return this.length;
    }

    /**
     * Shows the first track in the queue.
     * @returns {Track | undefined} - The first track in the queue or undefined if there are none.
     */
    public first(): Track | undefined {
        return this[0];
    }

    /**
     * Adds a track to the queue.
     * @param {Track} track - The track to add to the queue.
     * @returns {Queue} - The queue with the added track.
     */
    public add(track: Track): Queue {
        this.push(track);
        return this;
    }

    /**
     * Removes a track from the queue based on its index.
     * @param {number} index - The index of the track to remove (zero-based).
     * @returns {Track | undefined} - The removed track or undefined if there was no track at the specified index.
     */
    public remove(index: number): Track | undefined {
        return super.splice(index, 1)[0];
    }

    /**
     * Clears the entire player's queue.
     * @returns {Track[]} - All cleared tracks or an empty array if there were none to clear.
     */
    public clear(): Track[] | [] {
        return super.splice(0);
    }

    /**
     * Shuffles the Queue
     */
    public shuffle(): void {
        for (let i = this.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
    }
}
