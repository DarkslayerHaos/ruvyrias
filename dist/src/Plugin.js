"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
/**
 * Represents a plugin for the Ruvyrias library.
 */
class Plugin {
    /** The name of the plugin. */
    name;
    /**
     * Creates an instance of Plugin.
     * @param {string} name - The name of the plugin.
     */
    constructor(name) {
        this.name = name;
    }
    /**
     * Loads the plugin into the Ruvyrias instance.
     * @param {Ruvyrias} ruvyrias - The Ruvyrias instance to load the plugin into.
     * @returns {Promise<void>}
     */
    async load(ruvyrias) { }
}
exports.Plugin = Plugin;
