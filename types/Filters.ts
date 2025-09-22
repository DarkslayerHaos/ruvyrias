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