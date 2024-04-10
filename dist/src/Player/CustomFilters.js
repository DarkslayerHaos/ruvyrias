"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFilter = void 0;
const Filters_1 = require("./Filters");
/**
 * The customFilters class that is used to apply filters to the currently playing track
 * @extends Filters
 */
class customFilter extends Filters_1.Filters {
    bassboost;
    slowmode;
    nightcore;
    daycore;
    vaporwave;
    _8d;
    /**
     * The customFilters class that is used to apply filters to the currently playing track
     * @param player Player
     */
    constructor(player) {
        super(player);
        this.player = player;
        this.bassboost = 0;
        this.slowmode = null;
        this.nightcore = null;
        this.daycore = null;
        this.vaporwave = null;
        this._8d = null;
    }
    /**
     * Sets the Bass boost value for the player.
     * @param {number} value - The value of the Bass boost, it should be between 0 to 5.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    setBassboost(value) {
        if (!this.player)
            return this;
        if (value < 0 && value > 6) {
            throw Error('Bassboost value must be between 0 to 5');
        }
        this.bassboost = value;
        const num = (value - 1) * (1.25 / 9) - 0.25;
        this.setEqualizer(Array(13).fill(0).map((n, i) => ({
            band: i,
            gain: num
        })));
        return this;
    }
    /**
     * Sets the Slowmode filter for the player.
     * @param {boolean} value - The value to enable or disable Slowmode.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    setSlowmode(value) {
        if (!this.player)
            return this;
        this.slowmode = value;
        this.setTimescale(value ? { speed: 0.5, pitch: 1.0, rate: 0.8, } : null);
        return this;
    }
    /**
     * Sets the Nightcore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Nightcore.
     * @returns {Filter} - Returns the current instance of the player or undefined if player is not available.
     */
    setNightcore(value) {
        if (!this.player)
            return this;
        this.nightcore = value;
        if (value) {
            this.vaporwave = false;
            this.daycore = false;
        }
        this.setTimescale(value ? { speed: 1.165, pitch: 1.125, rate: 1.05 } : null);
        return this;
    }
    /**
     * Sets the Daycore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Daycore.
     * @returns {Filter} - Returns the current instance of the player or undefined if player is not available.
     */
    setDaycore(value) {
        if (!this.player)
            return this;
        this.daycore = value;
        if (value) {
            this.vaporwave = false;
            this.nightcore = false;
        }
        this.setEqualizer([
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
        this.setTimescale(value ? { pitch: 0.63, rate: 1.05 } : null);
        return this;
    }
    /**
     * Sets the Vaporwave filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Vaporwave.
     * @returns {Filters} - Returns nothing.
     */
    setVaporwave(value) {
        if (!this.player)
            return this;
        this.vaporwave = value;
        if (value) {
            this.nightcore = false;
            this.daycore = false;
        }
        this.setTimescale(value ? { pitch: 0.5 } : null);
        return this;
    }
    /**
     * Sets the 8D filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable the 8D filter.
     * @returns {Filters} - Returns nothing.
     */
    set8D(value) {
        if (!this.player)
            return this;
        this._8d = value;
        this.setRotation(value ? { rotationHz: 0.2 } : null);
        return this;
    }
}
exports.customFilter = customFilter;
