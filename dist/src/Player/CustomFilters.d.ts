import { Player } from './Player';
import { Filters } from './Filters';
/**
 * The customFilters class that is used to apply filters to the currently playing track
 * @extends Filters
 */
export declare class customFilter extends Filters {
    bassboost: number;
    slowmode: boolean;
    nightcore: boolean;
    vaporwave: boolean;
    _8d: boolean;
    /**
     * The customFilters class that is used to apply filters to the currently playing track
     * @param player Player
     */
    constructor(player: Player);
    /**
     * Sets the Bass boost value for the player.
     * @param {number} value - The value of the Bass boost, it should be between 0 to 5.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    setBassboost(value: number): Filters;
    /**
     * Sets the Slowmode filter for the player.
     * @param {boolean} value - The value to enable or disable Slowmode.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    setSlowmode(value: boolean): Filters;
    /**
     * Sets the Nightcore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Nightcore.
     * @returns {Filter} - Returns the current instance of the player or undefined if player is not available.
     */
    setNightcore(value: boolean): Filters;
    /**
     * Sets the Daycore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Daycore.
     * @returns {Filter} - Returns the current instance of the player or undefined if player is not available.
     */
    setDaycore(value: boolean): Filters;
    /**
     * Sets the Vaporwave filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Vaporwave.
     * @returns {Filters} - Returns nothing.
     */
    setVaporwave(value: boolean): Filters;
    /**
     * Sets the 8D filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable the 8D filter.
     * @returns {Filters} - Returns nothing.
     */
    set8D(value: boolean): Filters;
}
