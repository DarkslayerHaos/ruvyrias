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
    }

    /**
     * Sets the equalizer bands for the currently playing track.
     * @param {Band[]} bands - An array of bands to set the equalizer to.
     * @returns {Filters} - Returns the Filters instance for method chaining.
     */
    public setEqualizer(bands: Band[]): Filters {
        this.equalizer = bands;
        this.updateFilters();

        return this;
    }

    /**
     * Changes the karaoke options applied to the currently playing track.
     * @param {KaraokeOptions} karaoke - An object that conforms to the KaraokeOptions type, defining a range of frequencies to mute.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public setKaraoke(karaoke?: KaraokeOptions): Filters {
        this.karaoke = karaoke ?? null;
        this.updateFilters();

        return this;
    }

    /**
     * Changes the timescale options applied to the currently playing track.
     * @param {TimescaleOptions | null} timescale - An object that conforms to the TimescaleOptions type, defining the timescale to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public setTimescale(timescale?: TimescaleOptions | null): Filters {
        this.timescale = timescale ?? null;
        this.updateFilters();

        return this;
    }

    /**
     * Changes the tremolo options applied to the currently playing track.
     * @param {TremoloOptions | null} tremolo - An object that conforms to the TremoloOptions type, defining the tremolo to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public setTremolo(tremolo?: TremoloOptions | null): Filters {
        this.tremolo = tremolo ?? null;
        this.updateFilters();

        return this;
    }

    /**
     * Changes the vibrato options applied to the currently playing track.
     * @param {VibratoOptions | null} vibrato - An object that conforms to the VibratoOptions type, defining the vibrato to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public setVibrato(vibrato?: VibratoOptions | null): Filters {
        this.vibrato = vibrato ?? null;
        this.updateFilters();

        return this;
    }

    /**
     * Changes the rotation options applied to the currently playing track.
     * @param {RotationOptions | null} rotation - An object that conforms to the RotationOptions type, defining the rotation to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public setRotation(rotation?: RotationOptions | null): Filters {
        this.rotation = rotation ?? null;
        this.updateFilters();

        return this;
    }

    /**
     * Changes the distortion options applied to the currently playing track.
     * @param {DistortionOptions} distortion - An object that conforms to the DistortionOptions type, defining the distortion to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public setDistortion(distortion: DistortionOptions): Filters {
        this.distortion = distortion ?? null;
        this.updateFilters();

        return this;
    }

    /**
     * Changes the channel mix options applied to the currently playing track.
     * @param {ChannelMixOptions} mix - An object that conforms to the ChannelMixOptions type, defining the channel mix to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public setChannelMix(mix: ChannelMixOptions): Filters {
        this.channelMix = mix ?? null;
        this.updateFilters();

        return this;
    }

    /**
     * Changes the low pass options applied to the currently playing track.
     * @param {LowPassOptions} pass - An object that conforms to the LowPassOptions type, defining the low pass to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public setLowPass(pass: LowPassOptions): Filters {
        this.lowPass = pass ?? null;
        this.updateFilters();

        return this;
    }

    /**
     * Changes the filters of the currently playing track.
     * @param {FiltersOptions} options - An object that conforms to the FiltersOptions type, defining the filters to apply.
     * @returns {Filters} - Returns the current Filters instance for method chaining.
     */
    public setFilters(options: FiltersOptions): Filters {
        this.player.filters = this.player.ruvyrias.options.customFilter ? new this.player.ruvyrias.options.customFilter(this, options) : new Filters(this.player, options);
        this.updateFilters();

        return this;
    }

    /**
     * Clears all filters applied to the currently playing track.
     * @returns {Filters} - Returns the current Filters instance with no filters applied.
     */
    public clearFilters(): Filters {
        this.player.filters = this.player.ruvyrias.options.customFilter ? new this.player.ruvyrias.options.customFilter(this.player) : new Filters(this.player);
        this.updateFilters()

        return this;
    }

    /**
     * Updates the filters applied to the currently playing track on the lavalink node.
     * @returns {Filters} - Returns the current Filters instance with updated filters.
     */
    public updateFilters(): Filters {
        const { equalizer, karaoke, timescale, tremolo, vibrato, rotation, distortion, channelMix, lowPass, volume } = this;

        this.player.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: {
                filters: {
                    volume, equalizer, karaoke, timescale, tremolo, vibrato, rotation, distortion, channelMix, lowPass,
                }
            }
        })

        return this;
    }
}