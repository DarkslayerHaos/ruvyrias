"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;
class Track {
    /** The base64 encoded track data */
    track;
    /** Info about the track */
    info;
    /** Additional track info provided by plugins */
    pluginInfo;
    /** Additional track data provided via the Update Player endpoint */
    userData;
    constructor(data, requester) {
        this.track = data?.encoded ?? null;
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
exports.Track = Track;
