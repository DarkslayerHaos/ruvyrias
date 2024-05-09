"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filters = void 0;
/**
 * The Filters class that is used to apply filters to the currently player
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
    bassBoost;
    slowMode;
    nightcore;
    daycore;
    vaporwave;
    chipmunk;
    _8d;
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
        this.bassBoost = options?.bassBoost ?? 0;
        this.slowMode = options?.slowMode ?? null;
        this.nightcore = options?.nightcore ?? null;
        this.daycore = options?.daycore ?? null;
        this.vaporwave = options?.vaporwave ?? null;
        this.chipmunk = options?.chipmunk ?? null;
        this._8d = options?._8d ?? null;
    }
    /**
     * Sets the equalizer bands for the currently player.
     * @param {Band[]} bands - An array of bands to set the equalizer to.
     * @returns {Promise<Filters>} - Returns the Filters instance for method chaining.
     */
    async setEqualizer(bands) {
        this.equalizer = bands;
        await this.updateFilters();
        return this;
    }
    /**
     * Changes the karaoke options applied to the currently player.
     * @param {KaraokeOptions} karaoke - An object that conforms to the KaraokeOptions type, defining a range of frequencies to mute.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    async setKaraoke(karaoke) {
        this.karaoke = karaoke ?? null;
        await this.updateFilters();
        return this;
    }
    /**
     * Changes the timescale options applied to the currently player.
     * @param {TimescaleOptions | null} timescale - An object that conforms to the TimescaleOptions type, defining the timescale to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    async setTimescale(timescale) {
        this.timescale = timescale ?? null;
        await this.updateFilters();
        return this;
    }
    /**
     * Changes the tremolo options applied to the currently player.
     * @param {TremoloOptions | null} tremolo - An object that conforms to the TremoloOptions type, defining the tremolo to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    async setTremolo(tremolo) {
        this.tremolo = tremolo ?? null;
        await this.updateFilters();
        return this;
    }
    /**
     * Changes the vibrato options applied to the currently player.
     * @param {VibratoOptions | null} vibrato - An object that conforms to the VibratoOptions type, defining the vibrato to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    async setVibrato(vibrato) {
        this.vibrato = vibrato ?? null;
        await this.updateFilters();
        return this;
    }
    /**
     * Changes the rotation options applied to the currently player.
     * @param {RotationOptions | null} rotation - An object that conforms to the RotationOptions type, defining the rotation to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    async setRotation(rotation) {
        this.rotation = rotation ?? null;
        await this.updateFilters();
        return this;
    }
    /**
     * Changes the distortion options applied to the currently player.
     * @param {DistortionOptions} distortion - An object that conforms to the DistortionOptions type, defining the distortion to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    async setDistortion(distortion) {
        this.distortion = distortion ?? null;
        await this.updateFilters();
        return this;
    }
    /**
     * Changes the channel mix options applied to the currently player.
     * @param {ChannelMixOptions} mix - An object that conforms to the ChannelMixOptions type, defining the channel mix to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    async setChannelMix(mix) {
        this.channelMix = mix ?? null;
        await this.updateFilters();
        return this;
    }
    /**
     * Changes the low pass options applied to the currently player.
     * @param {LowPassOptions} pass - An object that conforms to the LowPassOptions type, defining the low pass to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    async setLowPass(pass) {
        this.lowPass = pass ?? null;
        await this.updateFilters();
        return this;
    }
    /**
     * Sets the Bass boost value for the player.
     * @param {number} value - The value of the Bass boost, it should be between 0 to 5.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    async setBassboost(value) {
        if (!this.player)
            return this;
        if (value < 0 && value > 6) {
            throw Error('Bassboost value must be between 0 to 5');
        }
        this.bassBoost = value;
        const num = (value - 1) * (1.25 / 9) - 0.25;
        await this.setEqualizer(Array(13)
            .fill(0)
            .map((n, i) => ({
            band: i,
            gain: num,
        })));
        return this;
    }
    /**
     * Sets the Slowmode filter for the player.
     * @param {boolean} value - The value to enable or disable Slowmode.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    async setSlowmode(value, options) {
        if (!this.player)
            return this;
        this.slowMode = value;
        await this.setTimescale(value
            ? {
                speed: options?.speed ?? 0.5,
                pitch: options?.pitch ?? 1.0,
                rate: options?.rate ?? 0.8,
            }
            : null);
        return this;
    }
    /**
     * Sets the Nightcore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Nightcore.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    async setNightcore(value, options) {
        if (!this.player)
            return this;
        this.nightcore = value;
        if (value) {
            this.vaporwave = false;
            this.daycore = false;
            this.chipmunk = false;
        }
        await this.setTimescale(value
            ? {
                speed: options?.speed ?? 1.165,
                pitch: options?.pitch ?? 1.125,
                rate: options?.rate ?? 1.05,
            }
            : null);
        return this;
    }
    /**
     * Sets the Daycore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Daycore.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    async setDaycore(value, options) {
        if (!this.player)
            return this;
        this.daycore = value;
        if (value) {
            this.vaporwave = false;
            this.nightcore = false;
            this.chipmunk = false;
        }
        await this.setEqualizer([
            { band: 0, gain: 0 },
            { band: 1, gain: 0 },
            { band: 2, gain: 0 },
            { band: 3, gain: 0 },
            { band: 4, gain: 0 },
            { band: 5, gain: 0 },
            { band: 6, gain: 0 },
            { band: 7, gain: 0 },
            { band: 8, gain: -0.25 },
            { band: 9, gain: -0.25 },
            { band: 10, gain: -0.25 },
            { band: 11, gain: -0.25 },
            { band: 12, gain: -0.25 },
            { band: 13, gain: -0.25 },
        ]);
        await this.setTimescale(value ? { pitch: options?.pitch ?? 0.63, rate: options?.rate ?? 1.05 } : null);
        return this;
    }
    /**
     * Sets the Vaporwave filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Vaporwave.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    async setVaporwave(value, options) {
        if (!this.player)
            return this;
        this.vaporwave = value;
        if (value) {
            this.nightcore = false;
            this.daycore = false;
            this.chipmunk = false;
        }
        await this.setTimescale(value ? { pitch: options?.pitch ?? 0.5 } : null);
        return this;
    }
    /**
     * Sets the 8D filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable the 8D filter.
     * @param {RotationOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    async set8D(value, options) {
        if (!this.player)
            return this;
        this._8d = value;
        await this.setRotation(value ? { rotationHz: options?.rotationHz ?? 0.2 } : null);
        return this;
    }
    /**
     * Sets the Chipmunk filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable the Chipmunk filter.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    async setChipmunk(value, options) {
        if (!this.player)
            return this;
        this.chipmunk = value;
        await this.setTimescale(value
            ? {
                speed: options?.speed ?? 1.05,
                pitch: options?.pitch ?? 1.35,
                rate: options?.rate ?? 1.25,
            }
            : null);
        return this;
    }
    /**
     * Clear all filters for the player.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    async clearFilters() {
        await this.player.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: { filters: {} },
        });
        return this;
    }
    /**
     * Updates the filters applied to the currently player on the lavalink node.
     * @returns {Promise<Filters>} - Returns the current Filters instance with updated filters.
     */
    async updateFilters() {
        const { equalizer, karaoke, timescale, tremolo, vibrato, rotation, distortion, channelMix, lowPass, volume, } = this;
        await this.player.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: {
                filters: {
                    volume,
                    equalizer,
                    karaoke,
                    timescale,
                    tremolo,
                    vibrato,
                    rotation,
                    distortion,
                    channelMix,
                    lowPass,
                },
            },
        });
        return this;
    }
}
exports.Filters = Filters;
