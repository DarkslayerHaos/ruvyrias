import { Player } from './Player';
import {
    Band,
    KaraokeOptions,
    TimescaleOptions,
    TremoloOptions,
    VibratoOptions,
    RotationOptions,
    DistortionOptions,
    ChannelMixOptions,
    LowPassOptions,
    FiltersOptions
} from '../types/Filters';

/**
 * The Filters class that is used to apply filters to the currently player
 */
export class Filters {
    public readonly player: Player;
    public readonly volume: number;
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
     * Sets the equalizer bands for the player.
     * @param {Band[]} bands - Array of equalizer bands to apply.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setEqualizer(bands: Band[]): Promise<Filters> {
        this.equalizer = bands;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the karaoke effect on the player.
     * @param {KaraokeOptions} [karaoke] - Karaoke filter settings or null to disable.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setKaraoke(karaoke?: KaraokeOptions): Promise<Filters> {
        this.karaoke = karaoke ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the timescale effect on the player.
     * @param {TimescaleOptions | null} [timescale] - Timescale filter settings or null to disable.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setTimescale(timescale?: TimescaleOptions | null): Promise<Filters> {
        this.timescale = timescale ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the tremolo effect on the player.
     * @param {TremoloOptions | null} [tremolo] - Tremolo filter settings or null to disable.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setTremolo(tremolo?: TremoloOptions | null): Promise<Filters> {
        this.tremolo = tremolo ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the vibrato effect on the player.
     * @param {VibratoOptions | null} [vibrato] - Vibrato filter settings or null to disable.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setVibrato(vibrato?: VibratoOptions | null): Promise<Filters> {
        this.vibrato = vibrato ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the rotation effect on the player.
     * @param {RotationOptions | null} [rotation] - Rotation filter settings or null to disable.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setRotation(rotation?: RotationOptions | null): Promise<Filters> {
        this.rotation = rotation ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the distortion effect on the player.
     * @param {DistortionOptions} distortion - Distortion filter settings.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setDistortion(distortion: DistortionOptions): Promise<Filters> {
        this.distortion = distortion ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the channel mix effect on the player.
     * @param {ChannelMixOptions} mix - Channel mix filter settings.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setChannelMix(mix: ChannelMixOptions): Promise<Filters> {
        this.channelMix = mix ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the low pass filter on the player.
     * @param {LowPassOptions} pass - Low pass filter settings.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setLowPass(pass: LowPassOptions): Promise<Filters> {
        this.lowPass = pass ?? null;
        await this.updateFilters();

        return this;
    }

    /**
     * Sets the bass boost level on the player.
     * @param {number} value - Bass boost value (0-5).
     * @returns {Promise<Filters>} The Filters instance for chaining.
     * @throws {Error} If value is outside allowed range.
     */
    public async setBassboost(value: number): Promise<Filters> {
        if (!this.player) return this;
        if (value < 0 && value > 6) {
            throw Error('Bassboost value must be between 0 to 5');
        }

        this.bassBoost = value;

        const num = (value - 1) * (1.25 / 9) - 0.25;
        await this.setEqualizer(Array(13).fill(0).map((n, i) => ({
            band: i,
            gain: num
        })));

        return this;
    }

    /**
     * Enables or disables the Slowmode effect.
     * @param {boolean} value - Whether to enable Slowmode.
     * @param {TimescaleOptions} [options] - Optional custom timescale settings.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setSlowmode(value: boolean, options?: TimescaleOptions): Promise<Filters> {
        if (!this.player) return this;
        this.slowMode = value;

        await this.setTimescale(value ? { speed: options?.speed ?? 0.5, pitch: options?.pitch ?? 1.0, rate: options?.rate ?? 0.8, } : null);
        return this;
    }

    /**
     * Enables or disables the Nightcore effect.
     * @param {boolean} value - Whether to enable Nightcore.
     * @param {TimescaleOptions} [options] - Optional custom timescale settings.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setNightcore(value: boolean, options?: TimescaleOptions): Promise<Filters> {
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
     * Enables or disables the Daycore effect.
     * @param {boolean} value - Whether to enable Daycore.
     * @param {Omit<TimescaleOptions, 'speed'>} [options] - Optional custom timescale settings.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setDaycore(value: boolean, options?: Omit<TimescaleOptions, 'speed'>): Promise<Filters> {
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
     * Enables or disables the Vaporwave effect.
     * @param {boolean} value - Whether to enable Vaporwave.
     * @param {TimescaleOptions} [options] - Optional custom timescale settings.
     * @returns {Promise<Filters>} The Filters instance for chaining.
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
     * Enables or disables the 8D effect.
     * @param {boolean} value - Whether to enable 8D effect.
     * @param {RotationOptions} [options] - Optional rotation settings.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async set8D(value: boolean, options?: RotationOptions): Promise<Filters> {
        if (!this.player) return this;
        this._8d = value;

        await this.setRotation(value ? { rotationHz: options?.rotationHz ?? 0.2 } : null);
        return this;
    }

    /**
     * Enables or disables the Chipmunk effect.
     * @param {boolean} value - Whether to enable Chipmunk effect.
     * @param {TimescaleOptions} [options] - Optional custom timescale settings.
     * @returns {Promise<Filters>} The Filters instance for chaining.
     */
    public async setChipmunk(value: boolean, options?: TimescaleOptions): Promise<Filters> {
        if (!this.player) return this;
        this.chipmunk = value;

        await this.setTimescale(value ? { speed: options?.speed ?? 1.05, pitch: options?.pitch ?? 1.35, rate: options?.rate ?? 1.25 } : null);
        return this;
    }

    /**
     * Clears all filters applied to the player.
     * @returns {Promise<Filters>} The Filters instance after clearing filters.
     */
    public async clearFilters(): Promise<Filters> {
        await this.player.node.rest.updatePlayer({
            guildId: this.player.guildId,
            data: { filters: {} },
        });

        return this;
    }

    /**
     * Updates the player's filters on the Lavalink node.
     * @returns {Promise<Filters>} The Filters instance after updating filters.
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