"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
const Track_1 = require("./Track");
;
/**
 * Represents a response handler for processing responses from Lavalink when loading tracks.
 * This class encapsulates the loaded tracks and provides utility methods for accessing and handling them.
 */
class Response {
    tracks;
    loadType;
    playlistInfo;
    constructor(response, requester) {
        switch (response.loadType) {
            case 'playlist': {
                this.tracks = this.handleTracks(response.data.tracks, requester);
                this.playlistInfo = {
                    ...response.data.info,
                    type: 'playlist',
                };
                break;
            }
            case 'track': {
                this.tracks = this.handleTracks(response.data, requester);
                this.playlistInfo = {
                    type: 'noPlaylist'
                };
                break;
            }
            case 'search': {
                this.tracks = this.handleTracks(response.data, requester);
                this.playlistInfo = {
                    type: 'noPlaylist'
                };
                break;
            }
            default: {
                this.tracks = [];
                this.playlistInfo = {
                    type: 'noPlaylist'
                };
                break;
            }
        }
        this.loadType = response.loadType;
    }
    /**
     * Helper function to handle tracks in the Response class.
     * @param {TrackData | TrackData[]} data - The track data or an array of track data.
     * @param {any} requester - The requester object.
     * @returns {Track[]} An array of Track instances.
     */
    handleTracks(data, requester) {
        if (Array.isArray(data)) {
            return data.map((track) => new Track_1.Track(track, requester));
        }
        else {
            return [new Track_1.Track(data, requester)];
        }
    }
}
exports.Response = Response;
