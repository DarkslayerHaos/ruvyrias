"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
const Track_1 = require("./Track");
class Response {
    tracks;
    loadType;
    playlistInfo;
    constructor(response, requester) {
        switch (response.loadType) {
            case 'playlist': {
                this.tracks = response.data.tracks.map((track) => new Track_1.Track(track, requester));
                this.playlistInfo = response.data.info;
                break;
            }
            case 'track': {
                this.tracks = this.handleTracks(response.data, requester);
                break;
            }
            case 'search': {
                this.tracks = this.handleTracks(response.data, requester);
                break;
            }
            default: {
                this.tracks = [];
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
