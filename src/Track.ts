import { TrackInfo, PluginInfo, TrackData } from '../types';

/**
 * Represents a track with its associated data.
 */
export class Track {
    /** The base64 encoded track data */
    public encoded: string | null;
    /** Info about the track */
    public readonly info: TrackInfo;
    /** Additional track info provided by plugins */
    public readonly pluginInfo: PluginInfo | null;
    /** Additional track data provided via the Update Player endpoint */
    public readonly userData: object;

    constructor(data: TrackData, requester?: any) {
        this.encoded = data?.encoded ?? null;
        this.pluginInfo = data?.pluginInfo ?? null;
        this.userData = data?.userData;
        this.info = {
            sourceName: data?.info?.sourceName,
            identifier: data?.info?.identifier,
            title: data?.info?.title,
            author: data?.info?.author,
            album: data?.info?.album ?? this.pluginInfo?.albumName ?? null,
            uri: data?.info?.uri,
            artworkUrl: data?.info?.artworkUrl ?? null,
            isrc: data?.info?.isrc ?? null,
            length: data?.info?.length,
            position: data?.info?.position,
            isSeekable: data?.info?.isSeekable,
            isStream: data?.info?.isStream,
            requester
        };
    }
}