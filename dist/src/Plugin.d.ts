import { Ruvyrias } from './Ruvyrias';
/**
 * Represents a plugin for the Ruvyrias library.
 */
export declare class Plugin {
    /** The name of the plugin. */
    readonly name: string;
    /**
     * Creates an instance of Plugin.
     * @param {string} name - The name of the plugin.
     */
    constructor(name: string);
    /**
     * Loads the plugin into the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance to load the plugin into.
     * @returns {Promise<void>}
     */
    load(ruvyrias: Ruvyrias): Promise<void>;
}
