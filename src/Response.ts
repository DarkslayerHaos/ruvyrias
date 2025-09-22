import { LoadType, PlaylistInfo, LoadTrackResponse } from '../types';
import { TrackData } from '../types';
import { Track } from './Track';

/**
 * Represents a response from Lavalink when loading tracks.
 * Encapsulates tracks and provides utility methods to access them.
 */
export class Response {
    public readonly tracks: Track[];
    public readonly loadType: LoadType;
    public readonly playlistInfo?: PlaylistInfo

    constructor(response: LoadTrackResponse, requester: Object | unknown | null) {
        switch (response.loadType) {
            case 'playlist': {
                this.tracks = this.handleTracks(response.data.tracks, requester as object);
                this.playlistInfo = {
                    ...response.data.info,
                    type: 'playlist',
                };
                break;
            }

            case 'track': {
                this.tracks = this.handleTracks(response.data, requester as object);
                break;
            }

            case 'search': {
                this.tracks = this.handleTracks(response.data, requester as object);
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
     * Helper function to convert raw track data into Track instances.
     * @param {TrackData | TrackData[]} data - Single or multiple track data objects.
     * @param {Object | null} requester - The requester of the track(s).
     * @returns {Track[]} - Array of Track instances.
     */
    private handleTracks(data: TrackData | TrackData[], requester: Object | null): Track[] {
        if (Array.isArray(data)) {
            return data.map((track) => new Track(track, requester));
        } else {
            return [new Track(data, requester)];
        }
    }
}