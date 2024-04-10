import { Player } from './Player';

/**
 * The Band interface that is used to define the band and gain of an equalizer band
 * @interface
 * @property {number} band The band to set the gain of
 * @property {number} gain The gain to set the band to
 */
interface Band {
    band: number;
    gain: number;
}

/**
 * The karaokeOptions interface that is used to define the karaoke options to apply to the currently playing track
 * @interface
 * @property {number} level The level of the karaoke effect to apply
 * @property {number} monoLevel The mono level of the karaoke effect to apply
 * @property {number} filterBand The filter band of the karaoke effect to apply
 * @property {number} filterWidth The filter width of the karaoke effect to apply
 */
interface KaraokeOptions {
    level: number;
    monoLevel: number;
    filterBand: number;
    filterWidth: number;
}

/**
 * The timescaleOptions interface that is used to define the timescale options to apply to the currently playing track
 * @interface
 * @property {number} speed The speed of the timescale effect to apply
 * @property {number} pitch The pitch of the timescale effect to apply
 * @property {number} rate The rate of the timescale effect to apply
 */
interface TimescaleOptions {
    speed?: number;
    pitch?: number;
    rate?: number;
}

/**
 * The tremoloOptions interface that is used to define the tremolo options to apply to the currently playing track
 * @interface
 * @property {number} frequency The frequency of the tremolo effect to apply
 * @property {number} depth The depth of the tremolo effect to apply
 */
interface TremoloOptions {
    frequency: number;
    depth: number;
}

/**
 * The vibratoOptions interface that is used to define the vibrato options to apply to the currently playing track
 * @interface
 * @property {number} frequency The frequency of the vibrato effect to apply
 * @property {number} depth The depth of the vibrato effect to apply
 */
interface VibratoOptions {
    frequency: number;
    depth: number;
}

/**
 * The rotationOptions interface that is used to define the rotation options to apply to the currently playing track
 * @interface
 * @property {number} rotationHz The rotation hz of the rotation effect to apply
 */
interface RotationOptions {
    rotationHz: number;
}

/**
 * The distortionOptions interface that is used to define the distortion options to apply to the currently playing track
 * @interface
 * @property {number} sinOffset The sin offset of the distortion effect to apply
 * @property {number} sinScale The sin scale of the distortion effect to apply
 * @property {number} cosOffset The cos offset of the distortion effect to apply
 * @property {number} cosScale The cos scale of the distortion effect to apply
 * @property {number} tanOffset The tan offset of the distortion effect to apply
 * @property {number} tanScale The tan scale of the distortion effect to apply
 * @property {number} offset The offset of the distortion effect to apply
 * @property {number} scale The scale of the distortion effect to apply
 */
interface DistortionOptions {
    sinOffset?: number;
    sinScale?: number;
    cosOffset?: number;
    cosScale?: number;
    tanOffset?: number;
    tanScale?: number;
    offset?: number;
    scale?: number;
}

/**
 * The ChannelMixOptions interface that is used to define the channelMix options to apply to the currently playing track
 * @interface
 * @property {number} leftToLeft The left to left of the channelMix effect to apply
 * @property {number} leftToRight The left to right of the channelMix effect to apply
 * @property {number} rightToLeft The right to left of the channelMix effect to apply
 * @property {number} rightToRight The right to right of the channelMix effect to apply
 */
export interface ChannelMixOptions {
    leftToLeft?: number;
    leftToRight?: number;
    rightToLeft?: number;
    rightToRight?: number;
}

/**
 * The FiltersOptions interface that is used to define the filters options to apply to the currently playing track
 * @interface
 * @property {number} volume The volume of the filters effect to apply
 * @property {Band[]} equalizer The equalizer of the filters effect to apply
 * @property {karaokeOptions} karaoke The karaoke of the filters effect to apply
 * @property {tremoloOptions} tremolo The tremolo of the filters effect to apply
 * @property {vibratoOptions} vibrato The vibrato of the filters effect to apply
 * @property {rotationOptions} rotation The rotation of the filters effect to apply
 * @property {distortionOptions} distortion The distortion of the filters effect to apply
 * @property {ChannelMixOptions} channelMix The channelMix of the filters effect to apply
 * @property {lowPassOptions} lowPass The lowPass of the filters effect to apply
 * @property {timescaleOptions} timescale The timescale of the filters effect to apply
 */
export interface FiltersOptions {
    volume?: number;
    equalizer?: Band[] | null;
    karaoke?: KaraokeOptions | null;
    tremolo?: TremoloOptions | null;
    vibrato?: VibratoOptions | null;
    rotation?: RotationOptions | null;
    distortion?: DistortionOptions | null;
    channelMix?: ChannelMixOptions | null;
    lowPass?: LowPassOptions | null;
    timescale?: TimescaleOptions | null;
    bassboost?: number | 0;
    slowmode?: boolean | null;
    nightcore?: boolean | null;
    daycore?: boolean | null;
    vaporwave?: boolean | null;
    chimpmunk?: boolean | null;
    _8d?: boolean | null;
}

/**
 * The lowPassOptions interface that is used to define the lowPass options to apply to the currently playing track
 * @interface
 * @property {number} smoothing The smoothing of the lowPass effect to apply
 */
interface LowPassOptions {
    smoothing: number;
}


/**
 * The Filters class that is used to apply filters to the currently playing track
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
    public bassboost: number | 0;
    public slowmode: boolean | null;
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
        this.bassboost = options?.bassboost ?? 0;
        this.slowmode = options?.slowmode ?? null;
        this.nightcore = options?.nightcore ?? null;
        this.daycore = options?.daycore ?? null;
        this.vaporwave = options?.vaporwave ?? null;
        this.chipmunk = options?.chimpmunk ?? null;
        this._8d = options?._8d ?? null;
    }

    /**
     * Sets the equalizer bands for the currently playing track.
     * @param {Band[]} bands - An array of bands to set the equalizer to.
     * @returns {Filters} - Returns the Filters instance for method chaining.
     */
    public async setEqualizer(bands: Band[]): Promise<Filters> {
        this.equalizer = bands;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the karaoke options applied to the currently playing track.
     * @param {KaraokeOptions} karaoke - An object that conforms to the KaraokeOptions type, defining a range of frequencies to mute.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public async setKaraoke(karaoke?: KaraokeOptions): Promise<Filters> {
        this.karaoke = karaoke ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the timescale options applied to the currently playing track.
     * @param {TimescaleOptions | null} timescale - An object that conforms to the TimescaleOptions type, defining the timescale to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public async setTimescale(timescale?: TimescaleOptions | null): Promise<Filters> {
        this.timescale = timescale ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the tremolo options applied to the currently playing track.
     * @param {TremoloOptions | null} tremolo - An object that conforms to the TremoloOptions type, defining the tremolo to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public async setTremolo(tremolo?: TremoloOptions | null): Promise<Filters> {
        this.tremolo = tremolo ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the vibrato options applied to the currently playing track.
     * @param {VibratoOptions | null} vibrato - An object that conforms to the VibratoOptions type, defining the vibrato to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public async setVibrato(vibrato?: VibratoOptions | null): Promise<Filters> {
        this.vibrato = vibrato ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the rotation options applied to the currently playing track.
     * @param {RotationOptions | null} rotation - An object that conforms to the RotationOptions type, defining the rotation to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public async setRotation(rotation?: RotationOptions | null): Promise<Filters> {
        this.rotation = rotation ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the distortion options applied to the currently playing track.
     * @param {DistortionOptions} distortion - An object that conforms to the DistortionOptions type, defining the distortion to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public async setDistortion(distortion: DistortionOptions): Promise<Filters> {
        this.distortion = distortion ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the channel mix options applied to the currently playing track.
     * @param {ChannelMixOptions} mix - An object that conforms to the ChannelMixOptions type, defining the channel mix to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public async setChannelMix(mix: ChannelMixOptions): Promise<Filters> {
        this.channelMix = mix ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Changes the low pass options applied to the currently playing track.
     * @param {LowPassOptions} pass - An object that conforms to the LowPassOptions type, defining the low pass to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public async setLowPass(pass: LowPassOptions): Promise<Filters> {
        this.lowPass = pass ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the Bass boost value for the player.
     * @param {number} value - The value of the Bass boost, it should be between 0 to 5.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    public async setBassboost(value: number): Promise<Filters> {
        if (!this.player) return this;
        if (value < 0 && value > 6) {
            throw Error('Bassboost value must be between 0 to 5');
        }

        this.bassboost = value;

        const num = (value - 1) * (1.25 / 9) - 0.25;
        await this.setEqualizer(Array(13).fill(0).map((n, i) => ({
            band: i,
            gain: num
        })));

        return this;
    }

    /**
     * Sets the Slowmode filter for the player.
     * @param {boolean} value - The value to enable or disable Slowmode.
     * @param {object} [options] - Optional parameters.
     * @returns {Filters} - Returns the current instance of the player or undefined if player is not available.
     */
    public async setSlowmode(value: boolean, options?: { speed?: number, pitch?: number, rate?: number }): Promise<Filters> {
        if (!this.player) return this;
        this.slowmode = value;

        await this.setTimescale(value ? { speed: options?.speed ?? 0.5, pitch: options?.pitch ?? 1.0, rate: options?.rate ?? 0.8, } : null);
        return this;
    }

    /**
     * Sets the Nightcore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Nightcore.
     * @param {object} [options] - Optional parameters.
     * @returns {Filter} - Returns the current instance of the player or undefined if player is not available.
     */
    public async setNightcore(value: boolean, options?: { speed?: number, pitch?: number, rate?: number }): Promise<Filters> {
        if (!this.player) return this;
        this.nightcore = value;

        if (value) {
            this.vaporwave = false;
            this.daycore = false;
            this.chipmunk = false;
        }

        await this.setTimescale(value ? { speed: options?.speed ?? 1.165, pitch: options?.pitch ?? 1.125, rate: options?.rate ?? 1.05 } : null);
        return this;
    }

    /**
     * Sets the Daycore filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Daycore.
     * @param {object} [options] - Optional parameters.
     * @returns {Filter} - Returns the current instance of the player or undefined if player is not available.
     */
    public async setDaycore(value: boolean, options?: { pitch?: number, rate?: number }): Promise<Filters> {
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
        await this.setTimescale(value ? { pitch: options?.pitch ?? 0.63, rate: options?.rate ?? 1.05 } : null);

        return this;
    }

    /**
     * Sets the Vaporwave filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable Vaporwave.
     * @param {object} [options] - Optional parameters.
     * @returns {Filters} - Returns nothing.
     */
    public async setVaporwave(value: boolean, options?: { pitch?: number }): Promise<Filters> {
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
     * @param {object} [options] - Optional parameters.
     * @returns {Filters} - Returns nothing.
     */
    public async set8D(value: boolean, options?: { rotationHz?: number }): Promise<Filters> {
        if (!this.player) return this;
        this._8d = value;

        await this.setRotation(value ? { rotationHz: options?.rotationHz ?? 0.2 } : null);
        return this;
    }

    /**
     * Sets the Chipmunk filter for the player.
     * @param {boolean} value - Boolean value indicating whether to enable or disable the Chipmunk filter.
     * @param {object} [options] - Optional parameters.
     * @returns {Filters} - Returns nothing.
     */
    public async setChipmunk(value: boolean, options?: { speed?: number, pitch?: number, rate?: number }): Promise<Filters> {
        if (!this.player) return this;
        this.chipmunk = value;

        await this.setTimescale(value ? { speed: options?.speed ?? 1.05, pitch: options?.pitch ?? 1.35, rate: options?.rate ?? 1.25 } : null);
        return this;
    }

    /**
     * Clear all filters for the player.
     * @returns {Promise<Filters>} - Returns nothing.
     */
    public async clearFilters(): Promise<Filters> {
        await this.player.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: { filters: {} },
        });

        return this;
    }

    /**
     * Updates the filters applied to the currently playing track on the lavalink node.
     * @returns {Filters} - Returns the current Filters instance with updated filters.
     */
    public async updateFilters(): Promise<Filters> {
        const { equalizer, karaoke, timescale, tremolo, vibrato, rotation, distortion, channelMix, lowPass, volume } = this;

        await this.player.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: {
                filters: { volume, equalizer, karaoke, timescale, tremolo, vibrato, rotation, distortion, channelMix, lowPass }
            }
        });

        return this;
    }
}