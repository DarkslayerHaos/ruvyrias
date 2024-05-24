import { Track } from './Track';
/**
 * Represents a queue of tracks in the player. Extends the Array class with additional methods.
 */
export default class Queue extends Array<Track> {
    constructor();
    /**
     * Gets the number of tracks in the queue.
     * @returns {number} - The number of tracks in the queue.
     */
    get size(): number;
    /**
     * Shows the first track in the queue.
     * @returns {Track | undefined} - The first track in the queue or undefined if there are none.
     */
    first(): Track | undefined;
    /**
     * Adds a track to the queue.
     * @param {Track} track - The track to add to the queue.
     * @returns {Queue} - The queue with the added track.
     */
    add(track: Track): Queue;
    /**
     * Removes a track from the queue based on its index.
     * @param {number} index - The index of the track to remove (zero-based).
     * @returns {Track | undefined} - The removed track or undefined if there was no track at the specified index.
     */
    remove(index: number): Track | undefined;
    /**
     * Clears the entire player's queue.
     * @returns {Track[]} - All cleared tracks or an empty array if there were none to clear.
     */
    clear(): Track[] | [];
    /**
     * Shuffles the Queue
     */
    shuffle(): void;
}
