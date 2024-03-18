import { Player } from './Player';
import { Filters } from './Filters';
/**
 * The customFilters class that is used to apply filters to the currently playing track
 * @extends Filters
 */
export declare class customFilter extends Filters {
    band: number;
    gain: number;
    slowmode: boolean;
    nightcore: boolean;
    vaporwave: boolean;
    _8d: boolean;
    bassboost: number;
    /**
     * The customFilters class that is used to apply filters to the currently playing track
     * @param player Player
     */
    constructor(player: Player);
    /**
     * Sets the bass boost value for the player.
     * @param {number} val - The value of the bass boost. Should be between 0 to 5.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    setBassboost(val: number): Filters;
    /**
     * Sets the slowmode filter for the player.
     * @param {boolean} val - The value to enable or disable slowmode.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    setSlowmode(val: boolean): Filters;
    /**
     * Sets the Nightcore filter for the player.
     * @param {boolean} val - Boolean value indicating whether to enable or disable Nightcore.
     * @returns {Filter | boolean} - Returns the boolean value if Nightcore is enabled or undefined if the player is not available.
     */
    setNightcore(val: boolean): Filters | boolean;
    /**
     * Sets the Vaporwave filter for the player.
     * @param {boolean} val - Boolean value indicating whether to enable or disable Vaporwave.
     * @returns {Filters} - Returns nothing.
     */
    setVaporwave(val: boolean): Filters;
    /**
     * Sets the 8D filter for the player.
     * @param {boolean} val - Boolean value indicating whether to enable or disable the 8D filter.
     * @returns {Filters} - Returns nothing.
     */
    set8D(val: boolean): Filters;
}
