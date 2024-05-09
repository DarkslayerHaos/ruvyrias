/**
 * Represents the data associated with a track.
 */
export interface TrackData {
    /** The encoded data of the track, if available. */
    encoded?: string;
    /** The detailed information about the track. */
    info: TrackInfo;
    /** Additional plugin-specific information related to the track, if available. */
    pluginInfo: PluginInfo | null;
    /** Additional track data provided via the Update Player endpoint. */
    userData: object;
}

/**
 * Represents detailed information about a track.
 */
export interface TrackInfo {
    /** The unique identifier of the track. */
    identifier: string;
    /** Indicates whether the track is seekable. */
    isSeekable: boolean;
    /** The author or artist of the track. */
    author: string;
    /** The duration of the track in milliseconds. */
    length: number;
    /** Indicates whether the track is a stream. */
    isStream: boolean;
    /** The position of the track, if available. */
    position?: number;
    /** The title of the track. */
    title: string;
    /** The URI or source link of the track. */
    uri: string;
    /** The name of the source providing the track. */
    sourceName: string;
    /** The URL of the artwork associated with the track. */
    artworkUrl: string | null;
    /** The album to which the track belongs, if applicable. */
    album: string | null;
    /** The International Standard Recording Code (ISRC) of the track, if available. */
    isrc: string | null;
    /** The requester or user associated with the track, if available. */
    requester?: any;
}

/**
 * Represents additional information provided by a plugin associated with a track.
 */
export interface PluginInfo {
    /** The type of the plugin information, such as 'album', 'playlist', 'artist', 'recommendations', or a custom type. */
    type?: 'album' | 'playlist' | 'artist' | 'recommendations' | string;
    /** The unique identifier associated with the plugin information. */
    identifier?: string;
    /** The author or artist associated with the plugin information. */
    author?: string;
    /** The name of the album, if applicable. */
    albumName?: string;
    /** The URL of the album's artwork, if available. */
    albumArtUrl?: string;
    /** The URL of the album, if applicable. */
    albumUrl?: string;
    /** The URL of the artist's page, if applicable. */
    artistUrl?: string;
    /** The URL of the general artwork associated with the plugin information. */
    artworkUrl?: string;
    /** The URL of the artist's specific artwork, if applicable. */
    artistArtworkUrl?: string;
    /** The preview URL associated with the plugin information, if available. */
    previewUrl?: string;
    /** Indicates whether the information is a preview. */
    isPreview?: boolean;
    /** The total number of tracks associated with the plugin information, if applicable. */
    totalTracks?: number;
    /** The URI or source link associated with the plugin information. */
    uri?: string;
    /** Additional client-specific data associated with the plugin information. */
    clientData?: { [key: string]: any };
}

/**
 * Represents a track with its associated data.
 */
export class Track {
    /** The base64 encoded track data */
    public track: string | null;
    /** Info about the track */
    public info: TrackInfo;
    /** Additional track info provided by plugins */
    public pluginInfo: PluginInfo | null;
    /** Additional track data provided via the Update Player endpoint */
    public userData: object;

    constructor(data: TrackData, requester?: any) {
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
            requester,
        };
    }
}
