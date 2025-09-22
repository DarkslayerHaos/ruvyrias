/**
 * Represents the different types of load operations.
 */
export type loadType =
    | 'track'
    | 'playlist'
    | 'search'
    | 'empty'
    | 'error';

/**
 * Represents a contributor to a track on Deezer, providing information such as their ID, name, and role.
 */
export interface DeezerContributor {
    id: number;
    name: string;
    link: string;
    share: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
    radio: boolean;
    tracklist: string;
    type: string;
    role: string;
}

/**
 * Represents an artist on Deezer, containing details such as their ID, name, and link.
 */
export interface DeezerArtist {
    data: any;
    id: number;
    name: string;
    link: string;
    share: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
    radio: boolean;
    tracklist: string;
    type: string;
}

/**
 * Represents an album on Deezer, containing information such as its ID, title, and release date.
 */
export interface DeezerAlbum {
    tracks: DeezerTrack;
    id: number;
    title: string;
    link: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
    md5_image: string;
    release_date: string;
    tracklist: string;
    type: string;
}

/**
 * Represents a track on Deezer, providing details like its ID, title, duration, and associated artist and album.
 */
export interface DeezerTrack {
    data: any
    id: string;
    readable: boolean;
    title: string;
    title_short: string;
    title_version: string;
    isrc: string;
    link: string;
    share: string;
    duration: number;
    track_position: number;
    disk_number: number;
    rank: number;
    release_date: string;
    explicit_lyrics: boolean;
    explicit_content_lyrics: number;
    explicit_content_cover: number;
    preview: string;
    bpm: number;
    gain: number;
    available_countries: string[];
    contributors: DeezerContributor[];
    md5_image: string;
    artist: DeezerArtist;
    album: DeezerAlbum;
    type: string;
}