"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
/**
 * Enumeration of configurations.
 * @enum {number|string}
 */
var Config;
(function (Config) {
    /** Client version. */
    Config[Config["clientVersion"] = 1.3] = "clientVersion";
    /** Client name. */
    Config["clientName"] = "Ruvyrias";
})(Config || (exports.Config = Config = {}));
