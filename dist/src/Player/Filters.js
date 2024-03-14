"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filters = void 0;
/**
 * The Filters class that is used to apply filters to the currently playing track
 */
class Filters {
    player;
    volume;
    equalizer;
    karaoke;
    timescale;
    tremolo;
    vibrato;
    rotation;
    distortion;
    channelMix;
    lowPass;
    constructor(player, options) {
        this.player = player;
        this.volume = 1.0;
        this.equalizer = [];
        this.karaoke = options?.karaoke ?? null;
        this.timescale = options?.timescale ?? null;
        this.vibrato = options?.vibrato ?? null;
        this.tremolo = options?.tremolo ?? null;
        this.rotation = options?.rotation ?? null;
        this.distortion = options?.distortion ?? null;
        this.channelMix = options?.channelMix ?? null;
        this.lowPass = options?.lowPass ?? null;
    }
    /**
     * Sets the equalizer bands for the currently playing track.
     * @param {Band[]} bands - An array of bands to set the equalizer to.
     * @returns {Filters} - Returns the Filters instance for method chaining.
     */
    setEqualizer(bands) {
        this.equalizer = bands;
        this.updateFilters();
        return this;
    }
    /**
     * Changes the karaoke options applied to the currently playing track.
     * @param {KaraokeOptions} karaoke - An object that conforms to the KaraokeOptions type, defining a range of frequencies to mute.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    setKaraoke(karaoke) {
        this.karaoke = karaoke ?? null;
        this.updateFilters();
        return this;
    }
    /**
     * Changes the timescale options applied to the currently playing track.
     * @param {TimescaleOptions | null} timescale - An object that conforms to the TimescaleOptions type, defining the timescale to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    setTimescale(timescale) {
        this.timescale = timescale ?? null;
        this.updateFilters();
        return this;
    }
    /**
     * Changes the tremolo options applied to the currently playing track.
     * @param {TremoloOptions | null} tremolo - An object that conforms to the TremoloOptions type, defining the tremolo to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    setTremolo(tremolo) {
        this.tremolo = tremolo ?? null;
        this.updateFilters();
        return this;
    }
    /**
     * Changes the vibrato options applied to the currently playing track.
     * @param {VibratoOptions | null} vibrato - An object that conforms to the VibratoOptions type, defining the vibrato to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    setVibrato(vibrato) {
        this.vibrato = vibrato ?? null;
        this.updateFilters();
        return this;
    }
    /**
     * Changes the rotation options applied to the currently playing track.
     * @param {RotationOptions | null} rotation - An object that conforms to the RotationOptions type, defining the rotation to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    setRotation(rotation) {
        this.rotation = rotation ?? null;
        this.updateFilters();
        return this;
    }
    /**
     * Changes the distortion options applied to the currently playing track.
     * @param {DistortionOptions} distortion - An object that conforms to the DistortionOptions type, defining the distortion to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    setDistortion(distortion) {
        this.distortion = distortion ?? null;
        this.updateFilters();
        return this;
    }
    /**
     * Changes the channel mix options applied to the currently playing track.
     * @param {ChannelMixOptions} mix - An object that conforms to the ChannelMixOptions type, defining the channel mix to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    setChannelMix(mix) {
        this.channelMix = mix ?? null;
        this.updateFilters();
        return this;
    }
    /**
     * Changes the low pass options applied to the currently playing track.
     * @param {LowPassOptions} pass - An object that conforms to the LowPassOptions type, defining the low pass to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    setLowPass(pass) {
        this.lowPass = pass ?? null;
        this.updateFilters();
        return this;
    }
    /**
     * Changes the filters of the currently playing track.
     * @param {FiltersOptions} options - An object that conforms to the FiltersOptions type, defining the filters to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    setFilters(options) {
        this.player.filters = this.player.ruvyrias.options.customFilter ? new this.player.ruvyrias.options.customFilter(this, options) : new Filters(this.player, options);
        this.updateFilters();
        return this;
    }
    /**
     * Clears all filters applied to the currently playing track.
     * @returns {Filters} - Returns the current Filters instance with no filters applied.
     */
    clearFilters() {
        this.player.filters = this.player.ruvyrias.options.customFilter ? new this.player.ruvyrias.options.customFilter(this.player) : new Filters(this.player);
        this.updateFilters();
        return this;
    }
    /**
     * Updates the filters applied to the currently playing track on the lavalink node.
     * @returns {Filters} - Returns the current Filters instance with updated filters.
     */
    updateFilters() {
        const { equalizer, karaoke, timescale, tremolo, vibrato, rotation, distortion, channelMix, lowPass, volume } = this;
        this.player.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: {
                filters: {
                    volume, equalizer, karaoke, timescale, tremolo, vibrato, rotation, distortion, channelMix, lowPass,
                }
            }
        });
        return this;
    }
}
exports.Filters = Filters;
