import { Player } from './Player';
import { Filters } from './Filters';

/**
 * The customFilters class that is used to apply filters to the currently playing track
 * @extends Filters
 */
export class customFilter extends Filters {
    public band: number;
    public gain: number;
    public slowmode: boolean;
    public nightcore: boolean;
    public vaporwave: boolean;
    public _8d: boolean;
    public bassboost: number;
    /**
     * The customFilters class that is used to apply filters to the currently playing track
     * @param player Player
     */
    constructor(player: Player) {
        super(player);
        this.player = player;
        this.bassboost = 0;
    }

    /**
     * Sets the bass boost value for the player.
     * @param {number} val - The value of the bass boost. Should be between 0 to 5.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    public setBassboost(val: number): Filters {
        if (!this.player) return this;
        if (val < 0 && val > 6) {
            throw Error('Bassboost value must be between 0 to 5');
        }
        this.bassboost = val;

        let num = (val - 1) * (1.25 / 9) - 0.25;
        this.setEqualizer(Array(13).fill(0).map((n, i) => ({
            band: i,
            gain: num
        })));

        return this;
    }

    /**
     * Sets the slowmode filter for the player.
     * @param {boolean} val - The value to enable or disable slowmode.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    public setSlowmode(val: boolean): Filters {
        if (!this.player) return this;
        this.slowmode = val;

        this.setFilters(val ? { timescale: { speed: 0.5, pitch: 1.0, rate: 0.8, }, } : this.clearFilters());
        return this;
    }

    /**
     * Sets the Nightcore filter for the player.
     * @param {boolean} val - Boolean value indicating whether to enable or disable Nightcore.
     * @returns {Filter | boolean} - Returns the boolean value if Nightcore is enabled or undefined if the player is not available.
     */
    public setNightcore(val: boolean): Filters | boolean {
        if (!this.player) return this;
        this.nightcore = val;

        this.setTimescale(val ? { rate: 1.5 } : null);
        if (val) {
            this.vaporwave = false;
        }

        return val;
    }

    /**
     * Sets the Vaporwave filter for the player.
     * @param {boolean} val - Boolean value indicating whether to enable or disable Vaporwave.
     * @returns {Filters} - Returns nothing.
     */
    public setVaporwave(val: boolean): Filters {
        if (!this.player) return this;
        this.vaporwave = val;

        if (val) {
            this.nightcore = false;
        }

        this.setTimescale(val ? { pitch: 0.5 } : null);
        return this;
    }

    /**
     * Sets the 8D filter for the player.
     * @param {boolean} val - Boolean value indicating whether to enable or disable the 8D filter.
     * @returns {Filters} - Returns nothing.
     */
    public set8D(val: boolean): Filters {
        if (!this.player) return this;
        this._8d = val;

        this.setRotation(val ? { rotationHz: 0.2 } : null);
        return this;
    }
}