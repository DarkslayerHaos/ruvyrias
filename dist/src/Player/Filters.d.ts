import { Player } from './Player';
/**
 * Represents a band and its gain in an equalizer.
 */
export interface Band {
    /** The band to set the gain of. */
    band: number;
    /** The gain to set the band to. */
    gain: number;
}
/**
 * Represents the options for applying karaoke effects to the currently player.
 */
export interface KaraokeOptions {
    /** The level of the karaoke effect to apply. */
    level: number;
    /** The mono level of the karaoke effect to apply. */
    monoLevel: number;
    /** The filter band of the karaoke effect to apply. */
    filterBand: number;
    /** The filter width of the karaoke effect to apply. */
    filterWidth: number;
}
/**
 * Represents the options for applying timescale effects to the currently player.
 */
export interface TimescaleOptions {
    /** The speed of the timescale effect to apply. */
    speed?: number;
    /** The pitch of the timescale effect to apply. */
    pitch?: number;
    /** The rate of the timescale effect to apply. */
    rate?: number;
}
/**
 * Represents the options for applying a low-pass filter to the currently player
 */
export interface LowPassOptions {
    /** The smoothing of the low-pass effect to apply. */
    smoothing: number;
}
/**
 * Represents the options for applying tremolo effects to the currently player.
 */
export interface TremoloOptions {
    /** The frequency of the tremolo effect to apply. */
    frequency: number;
    /** The depth of the tremolo effect to apply. */
    depth: number;
}
/**
 * Represents the options for applying vibrato effects to the currently player.
 */
export interface VibratoOptions {
    /** The frequency of the vibrato effect to apply. */
    frequency: number;
    /** The depth of the vibrato effect to apply. */
    depth: number;
}
/**
 * Represents the options for applying rotation effects to the currently player.
 */
export interface RotationOptions {
    /** The rotation hertz of the rotation effect to apply. */
    rotationHz: number;
}
/**
 * Represents the options for applying distortion effects to the currently player
 */
export interface DistortionOptions {
    /** The sin offset of the distortion effect to apply. */
    sinOffset?: number;
    /** The sin scale of the distortion effect to apply. */
    sinScale?: number;
    /** The cos offset of the distortion effect to apply. */
    cosOffset?: number;
    /** The cos scale of the distortion effect to apply. */
    cosScale?: number;
    /** The tan offset of the distortion effect to apply. */
    tanOffset?: number;
    /** The tan scale of the distortion effect to apply. */
    tanScale?: number;
    /** The offset of the distortion effect to apply. */
    offset?: number;
    /** The scale of the distortion effect to apply. */
    scale?: number;
}
/**
 * Represents the options for applying channel mix effects to the currently player
 */
export interface ChannelMixOptions {
    /** The left to left of the channelMix effect to apply. */
    leftToLeft?: number;
    /** The left to right of the channelMix effect to apply. */
    leftToRight?: number;
    /** The right to left of the channelMix effect to apply. */
    rightToLeft?: number;
    /** The right to right of the channelMix effect to apply. */
    rightToRight?: number;
}
/**
 * Represents the options for applying various filters to the currently player
 */
export interface FiltersOptions {
    /** The volume of the filters effect to apply. */
    volume?: number;
    /** The equalizer of the filters effect to apply. */
    equalizer?: Band[] | null;
    /** The karaoke of the filters effect to apply. */
    karaoke?: KaraokeOptions | null;
    /** The tremolo of the filters effect to apply. */
    tremolo?: TremoloOptions | null;
    /** The vibrato of the filters effect to apply. */
    vibrato?: VibratoOptions | null;
    /** The rotation of the filters effect to apply. */
    rotation?: RotationOptions | null;
    /** The distortion of the filters effect to apply. */
    distortion?: DistortionOptions | null;
    /** The channel mix of the filters effect to apply. */
    channelMix?: ChannelMixOptions | null;
    /** The low-pass filter options to apply. */
    lowPass?: LowPassOptions | null;
    /** The time-scale options to apply. */
    timescale?: TimescaleOptions | null;
    /** The bass boost level. */
    bassBoost?: number | 0;
    /** Whether to apply slow mode. */
    slowMode?: boolean | null;
    /** Whether to apply nightcore effect. */
    nightcore?: boolean | null;
    /** Whether to apply daycore effect. */
    daycore?: boolean | null;
    /** Whether to apply vaporwave effect. */
    vaporwave?: boolean | null;
    /** Whether to apply chipmunk effect. */
    chipmunk?: boolean | null;
    /** Whether to apply 8D effect. */
    _8d?: boolean | null;
}
/**
 * The Filters class that is used to apply filters to the currently player
 */
export declare class Filters {
    player: Player;
    volume: number;
    equalizer: Band[];
    karaoke: KaraokeOptions | null;
    timescale: TimescaleOptions | null;
    tremolo: TremoloOptions | null;
    vibrato: VibratoOptions | null;
    rotation: RotationOptions | null;
    distortion: DistortionOptions | null;
    channelMix: ChannelMixOptions | null;
    lowPass: LowPassOptions | null;
    bassBoost: number | 0;
    slowMode: boolean | null;
    nightcore: boolean | null;
    daycore: boolean | null;
    vaporwave: boolean | null;
    chipmunk: boolean | null;
    _8d: boolean | null;
    constructor(player: Player, options?: FiltersOptions);
    /**
     * Sets the equalizer bands for the currently player.
     * @param {Band[]} bands - An array of bands to set the equalizer to.
     * @returns {Promise<Filters>} - Returns the Filters instance for method chaining.
     */
    setEqualizer(bands: Band[]): Promise<Filters>;
    /**
     * Changes the karaoke options applied to the currently player.
     * @param {KaraokeOptions} karaoke - An object that conforms to the KaraokeOptions type, defining a range of frequencies to mute.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    setKaraoke(karaoke?: KaraokeOptions): Promise<Filters>;
    /**
     * Changes the timescale options applied to the currently player.
     * @param {TimescaleOptions | null} timescale - An object that conforms to the TimescaleOptions type, defining the timescale to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    setTimescale(timescale?: TimescaleOptions | null): Promise<Filters>;
    /**
     * Changes the tremolo options applied to the currently player.
     * @param {TremoloOptions | null} tremolo - An object that conforms to the TremoloOptions type, defining the tremolo to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    setTremolo(tremolo?: TremoloOptions | null): Promise<Filters>;
    /**
     * Changes the vibrato options applied to the currently player.
     * @param {VibratoOptions | null} vibrato - An object that conforms to the VibratoOptions type, defining the vibrato to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    setVibrato(vibrato?: VibratoOptions | null): Promise<Filters>;
    /**
     * Changes the rotation options applied to the currently player.
     * @param {RotationOptions | null} rotation - An object that conforms to the RotationOptions type, defining the rotation to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    setRotation(rotation?: RotationOptions | null): Promise<Filters>;
    /**
     * Changes the distortion options applied to the currently player.
     * @param {DistortionOptions} distortion - An object that conforms to the DistortionOptions type, defining the distortion to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    setDistortion(distortion: DistortionOptions): Promise<Filters>;
    /**
     * Changes the channel mix options applied to the currently player.
     * @param {ChannelMixOptions} mix - An object that conforms to the ChannelMixOptions type, defining the channel mix to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    setChannelMix(mix: ChannelMixOptions): Promise<Filters>;
    /**
     * Changes the low pass options applied to the currently player.
     * @param {LowPassOptions} pass - An object that conforms to the LowPassOptions type, defining the low pass to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    setLowPass(pass: LowPassOptions): Promise<Filters>;
    /**
     * Sets the Bass boost value for the player.
     * @param {number} value - The value of the Bass boost, it should be between 0 to 5.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    setBassboost(value: number): Promise<Filters>;
    /**
     * Sets the Slowmode filter for the player.
     * @param {boolean} value - The value to enable or disable Slowmode.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    setSlowmode(value: boolean, options?: TimescaleOptions): Promise<Filters>;
    /**
     * Sets the Nightcore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Nightcore.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    setNightcore(value: boolean, options?: TimescaleOptions): Promise<Filters>;
    /**
     * Sets the Daycore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Daycore.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    setDaycore(value: boolean, options?: Omit<TimescaleOptions, 'speed'>): Promise<Filters>;
    /**
     * Sets the Vaporwave filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Vaporwave.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    setVaporwave(value: boolean, options?: TimescaleOptions): Promise<Filters>;
    /**
     * Sets the 8D filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable the 8D filter.
     * @param {RotationOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    set8D(value: boolean, options?: RotationOptions): Promise<Filters>;
    /**
     * Sets the Chipmunk filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable the Chipmunk filter.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    setChipmunk(value: boolean, options?: TimescaleOptions): Promise<Filters>;
    /**
     * Clear all filters for the player.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    clearFilters(): Promise<Filters>;
    /**
     * Updates the filters applied to the currently player on the lavalink node.
     * @returns {Promise<Filters>} - Returns the current Filters instance with updated filters.
     */
    updateFilters(): Promise<Filters>;
}
