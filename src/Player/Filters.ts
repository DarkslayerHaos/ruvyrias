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
export class Filters {
    public player: Player;
    public volume: number;
    public equalizer: Band[];
    public karaoke: KaraokeOptions | null;
    public timescale: TimescaleOptions | null;
    public tremolo: TremoloOptions | null;
    public vibrato: VibratoOptions | null;
    public rotation: RotationOptions | null;
    public distortion: DistortionOptions | null;
    public channelMix: ChannelMixOptions | null;
    public lowPass: LowPassOptions | null;
    public bassBoost: number | 0;
    public slowMode: boolean | null;
    public nightcore: boolean | null;
    public daycore: boolean | null;
    public vaporwave: boolean | null;
    public chipmunk: boolean | null;
    public _8d: boolean | null;

    constructor(player: Player, options?: FiltersOptions) {
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
    public async setEqualizer(bands: Band[]): Promise<Filters> {
        this.equalizer = bands;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the karaoke options applied to the currently player.
     * @param {KaraokeOptions} karaoke - An object that conforms to the KaraokeOptions type, defining a range of frequencies to mute.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    public async setKaraoke(karaoke?: KaraokeOptions): Promise<Filters> {
        this.karaoke = karaoke ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the timescale options applied to the currently player.
     * @param {TimescaleOptions | null} timescale - An object that conforms to the TimescaleOptions type, defining the timescale to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    public async setTimescale(timescale?: TimescaleOptions | null): Promise<Filters> {
        this.timescale = timescale ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the tremolo options applied to the currently player.
     * @param {TremoloOptions | null} tremolo - An object that conforms to the TremoloOptions type, defining the tremolo to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    public async setTremolo(tremolo?: TremoloOptions | null): Promise<Filters> {
        this.tremolo = tremolo ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the vibrato options applied to the currently player.
     * @param {VibratoOptions | null} vibrato - An object that conforms to the VibratoOptions type, defining the vibrato to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    public async setVibrato(vibrato?: VibratoOptions | null): Promise<Filters> {
        this.vibrato = vibrato ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the rotation options applied to the currently player.
     * @param {RotationOptions | null} rotation - An object that conforms to the RotationOptions type, defining the rotation to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    public async setRotation(rotation?: RotationOptions | null): Promise<Filters> {
        this.rotation = rotation ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the distortion options applied to the currently player.
     * @param {DistortionOptions} distortion - An object that conforms to the DistortionOptions type, defining the distortion to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    public async setDistortion(distortion: DistortionOptions): Promise<Filters> {
        this.distortion = distortion ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the channel mix options applied to the currently player.
     * @param {ChannelMixOptions} mix - An object that conforms to the ChannelMixOptions type, defining the channel mix to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    public async setChannelMix(mix: ChannelMixOptions): Promise<Filters> {
        this.channelMix = mix ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the low pass options applied to the currently player.
     * @param {LowPassOptions} pass - An object that conforms to the LowPassOptions type, defining the low pass to apply.
     * @returns {Promise<Filters>} - Returns the current Filters instance for method chaining.
     */
    public async setLowPass(pass: LowPassOptions): Promise<Filters> {
        this.lowPass = pass ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the Bass boost value for the player.
     * @param {number} value - The value of the Bass boost, it should be between 0 to 5.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    public async setBassboost(value: number): Promise<Filters> {
        if (!this.player) return this;
        if (value < 0 && value > 6) {
            throw Error('Bassboost value must be between 0 to 5');
        }

        this.bassBoost = value;

        const num = (value - 1) * (1.25 / 9) - 0.25;
        await this.setEqualizer(
            Array(13)
                .fill(0)
                .map((n, i) => ({
                    band: i,
                    gain: num,
                }))
        );

        return this;
    }

    /**
     * Sets the Slowmode filter for the player.
     * @param {boolean} value - The value to enable or disable Slowmode.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    public async setSlowmode(value: boolean, options?: TimescaleOptions): Promise<Filters> {
        if (!this.player) return this;
        this.slowMode = value;

        await this.setTimescale(
            value
                ? {
                      speed: options?.speed ?? 0.5,
                      pitch: options?.pitch ?? 1.0,
                      rate: options?.rate ?? 0.8,
                  }
                : null
        );
        return this;
    }

    /**
     * Sets the Nightcore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Nightcore.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    public async setNightcore(value: boolean, options?: TimescaleOptions): Promise<Filters> {
        if (!this.player) return this;
        this.nightcore = value;

        if (value) {
            this.vaporwave = false;
            this.daycore = false;
            this.chipmunk = false;
        }

        await this.setTimescale(
            value
                ? {
                      speed: options?.speed ?? 1.165,
                      pitch: options?.pitch ?? 1.125,
                      rate: options?.rate ?? 1.05,
                  }
                : null
        );
        return this;
    }

    /**
     * Sets the Daycore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Daycore.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    public async setDaycore(
        value: boolean,
        options?: Omit<TimescaleOptions, 'speed'>
    ): Promise<Filters> {
        if (!this.player) return this;
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
        await this.setTimescale(
            value ? { pitch: options?.pitch ?? 0.63, rate: options?.rate ?? 1.05 } : null
        );

        return this;
    }

    /**
     * Sets the Vaporwave filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Vaporwave.
     * @param {TimescaleOptions} [options] - Optional custom parameters.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    public async setVaporwave(value: boolean, options?: TimescaleOptions): Promise<Filters> {
        if (!this.player) return this;
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
    public async set8D(value: boolean, options?: RotationOptions): Promise<Filters> {
        if (!this.player) return this;
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
    public async setChipmunk(value: boolean, options?: TimescaleOptions): Promise<Filters> {
        if (!this.player) return this;
        this.chipmunk = value;

        await this.setTimescale(
            value
                ? {
                      speed: options?.speed ?? 1.05,
                      pitch: options?.pitch ?? 1.35,
                      rate: options?.rate ?? 1.25,
                  }
                : null
        );
        return this;
    }

    /**
     * Clear all filters for the player.
     * @returns {Promise<Filters>} - Returns the current instance of the filters.
     */
    public async clearFilters(): Promise<Filters> {
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
    public async updateFilters(): Promise<Filters> {
        const {
            equalizer,
            karaoke,
            timescale,
            tremolo,
            vibrato,
            rotation,
            distortion,
            channelMix,
            lowPass,
            volume,
        } = this;

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
