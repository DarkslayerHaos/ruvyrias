"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deezer = void 0;
const Track_1 = require("../../src/Guild/Track");
const Plugin_1 = require("../../src/Plugin");
const DEEZER_SHARE_LINK = 'https://deezer.page.link/';
const DEEZER_PUBLIC_API = 'https://api.deezer.com/2.0';
const DEEZER_REGEX = /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/;
/**
 * Represents the Deezer class, extending the base Plugin class.
 */
class Deezer extends Plugin_1.Plugin {
    baseURL = DEEZER_PUBLIC_API;
    ruvyrias;
    _resolve;
    constructor() {
        super('Deezer');
    }
    /**
     * Overrides the load method of the Plugin class, enabling the Deezer plugin to interact with the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance.
     */
    async load(ruvyrias) {
        this.ruvyrias = ruvyrias;
        this._resolve = ruvyrias.resolve.bind(ruvyrias);
        ruvyrias.resolve = this.resolve.bind(this);
    }
    /**
     * Checks if the provided URL matches the Deezer regex pattern.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL matches the Deezer regex pattern, false otherwise.
     */
    check(url) {
        return DEEZER_REGEX.test(url);
    }
    /**
     * Checks if the provided URL is a Deezer share link.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL is a Deezer share link, false otherwise.
     */
    isDeezerShareLink(url) {
        if (url) {
            return url.startsWith(DEEZER_SHARE_LINK);
        }
        else {
            return false;
        }
    }
    /**
     * Resolves a track, album, playlist, or artist from Deezer based on the provided query, source, and requester.
     * @param {ResolveOptions} options - The options for resolving a track.
     * @returns {Promise<unknown>} - A promise that resolves to the result of the Deezer resolution.
     */
    async resolve({ query, source, requester }) {
        if (this.isDeezerShareLink(query)) {
            const newURL = await this.decodeDeezerShareLink(query);
            if (newURL.startsWith('https://www.deezer.com/')) {
                return this.resolve({ query: newURL, source: source ?? this.ruvyrias.options.defaultPlatform, requester });
            }
        }
        if (source?.toLowerCase() === 'dzsearch' && !this.check(query))
            return this.getQuerySong(query, requester);
        const [, type, id] = DEEZER_REGEX.exec(query) ?? [];
        switch (type) {
            case 'track': {
                return this.getTrack(id, requester);
            }
            case 'album': {
                return this.getAlbum(id, requester);
            }
            case 'playlist': {
                return this.getPlaylist(id, requester);
            }
            case 'artist': {
                return this.getArtist(id, requester);
            }
            default: {
                return this._resolve({ query, source: source ?? this.ruvyrias?.options.defaultPlatform, requester: requester });
            }
        }
    }
    /**
     * Retrieves information about a Deezer track based on the provided ID and requester.
     * @param {string} id - The ID of the Deezer track.
     * @param {any} requester - The requester of the track information.
     * @returns {Promise<DeezerTrack | object>} - A promise that resolves to the Deezer track information.
     */
    async getTrack(id, requester) {
        try {
            const track = await this.getData(`/track/${id}`);
            const unresolvedTracks = await this.buildUnresolved(track, requester);
            return this.buildResponse('track', [unresolvedTracks]);
        }
        catch (e) {
            return this.buildResponse('error', [], undefined, e.body?.error.message ?? e.message);
        }
    }
    /**
     * Retrieves information about a Deezer playlist based on the provided ID and requester.
     * @param {string} id - The ID of the Deezer playlist.
     * @param {any} requester - The requester of the playlist information.
     * @returns {Promise<object>} - A promise that resolves to the Deezer playlist information.
     */
    async getPlaylist(id, requester) {
        try {
            const playlist = await this.getData(`/playlist/${id}`);
            const unresolvedPlaylistTracks = await Promise.all(playlist.tracks.data.map((x) => this.buildUnresolved(x, requester)));
            return this.buildResponse('playlist', unresolvedPlaylistTracks, playlist.title);
        }
        catch (e) {
            return this.buildResponse('error', [], undefined, e.body?.error.message ?? e.message);
        }
    }
    /**
     * Retrieves information about a Deezer artist based on the provided ID and requester.
     * @param {string} id - The ID of the Deezer artist.
     * @param {any} requester - The requester of the artist information.
     * @returns {Promise<DeezerArtist | object>} - A promise that resolves to the Deezer artist information.
     */
    async getArtist(id, requester) {
        try {
            const artistData = await this.getData(`/artist/${id}`);
            const artist = await this.getData(`/artist/${id}/top`);
            await this.getArtistTracks(artist);
            if (artist.data.length === 0)
                return this.buildResponse('error', [], undefined, 'This artist does not have any top songs');
            const unresolvedArtistTracks = await Promise.all(artist.data.map((x) => this.buildUnresolved(x, requester)));
            return this.buildResponse('playlist', unresolvedArtistTracks, `${artistData.name}'s top songs`);
        }
        catch (e) {
            return this.buildResponse('error', [], undefined, e.body?.error.message ?? e.message);
        }
    }
    /**
     * Retrieves additional tracks for a Deezer artist to ensure a comprehensive list.
     * @param {any} deezerArtist - The Deezer artist object containing track information.
     * @returns {Promise<void>} - A promise that resolves once additional tracks are loaded.
     */
    async getArtistTracks(deezerArtist) {
        let nextPage = deezerArtist.next;
        let pageLoaded = 1;
        while (nextPage) {
            if (!nextPage)
                break;
            const req = await fetch(nextPage);
            const json = await req.json();
            deezerArtist.data.push(...json.data);
            nextPage = json.next;
            pageLoaded++;
        }
    }
    /**
     * Retrieves Deezer tracks based on a search query and requester.
     * @param {any} query - The search query.
     * @param {any} requester - The requester for the tracks.
     * @returns {Promise<unknown>} - A promise that resolves to Deezer tracks based on the search query.
     */
    async getQuerySong(query, requester) {
        if (this.check(query))
            return this.resolve(query);
        try {
            const tracks = await this.getData(`/search?q=${encodeURIComponent(query)}`);
            const unresolvedTracks = await Promise.all(tracks.data.map((x) => this.buildUnresolved(x, requester)));
            return this.buildResponse('search', unresolvedTracks);
        }
        catch (e) {
            return this.buildResponse('empty', [], undefined, e.body?.error.message ?? e.message);
        }
    }
    /**
     * Retrieves Deezer album tracks based on the album ID and requester.
     * @param {string} id - The ID of the Deezer album.
     * @param {any} requester - The requester for the album tracks.
     * @returns {Promise<DeezerAlbum | object>} - A promise that resolves to Deezer album tracks based on the album ID.
     */
    async getAlbum(id, requester) {
        try {
            const album = await this.getData(`/album/${id}`);
            const unresolvedAlbumTracks = await Promise.all(album.tracks.data.map((x) => this.buildUnresolved(x, requester)));
            return this.buildResponse('playlist', unresolvedAlbumTracks, album.title);
        }
        catch (e) {
            return this.buildResponse('error', [], undefined, e.body?.error.message ?? e.message);
        }
    }
    /**
     * Decodes a Deezer share link to obtain the original URL.
     * @param {string} url - The Deezer share link to decode.
     * @returns {Promise<string | null>} - A promise that resolves to the original URL after decoding the Deezer share link.
     */
    async decodeDeezerShareLink(url) {
        const req = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
        });
        if (req.status === 302) {
            const location = req.headers.get('location');
            return location;
        }
        return null;
    }
    /**
     * Fetches data from the Deezer API based on the specified endpoint.
     * @param {string} endpoint - The Deezer API endpoint to retrieve data from.
     * @returns {Promise<unknown>} - A promise that resolves to the data fetched from the Deezer API.
     */
    async getData(endpoint) {
        const req = await fetch(`${this.baseURL}/${endpoint}`, {});
        const data = await req.json();
        return data;
    }
    /**
     * Builds an unresolved track using the provided Deezer track object and requester.
     * @param {DeezerTrack} track - The Deezer track object.
     * @param {any} requester - The requester for the track.
     * @returns {Promise<Track>} - An unresolved Track instance representing the Deezer track.
     */
    async buildUnresolved(track, requester) {
        if (!track) {
            throw new ReferenceError('The Deezer track object was not provided');
        }
        return new Track_1.Track({
            encoded: '',
            info: {
                sourceName: 'deezer',
                identifier: track.id,
                title: track.title,
                author: track.artist ? track.artist.name : 'Unknown Artist',
                album: track.album.title ?? 'Unkown Album',
                uri: track.link,
                artworkUrl: track.album.cover_medium,
                isrc: track.isrc,
                length: track.duration * 1000,
                isSeekable: true,
                isStream: false,
            },
            pluginInfo: null,
            userData: {},
        }, requester);
    }
    /**
     * Builds a response object based on the specified parameters.
     * @param {loadType} loadType - The load type of the response.
     * @param {any} tracks - The tracks associated with the response.
     * @param {string | undefined} playlistName - The name of the playlist (optional).
     * @param {string | undefined} exceptionMsg - The exception message (optional).
     * @returns {object} - The constructed response object.
     */
    buildResponse(loadType, tracks, playlistName, exceptionMsg) {
        return Object.assign({
            loadType,
            tracks,
            playlistInfo: playlistName ? { name: playlistName } : {},
        }, exceptionMsg
            ? { exception: { message: exceptionMsg, severity: 'COMMON' } }
            : {});
    }
}
exports.Deezer = Deezer;
