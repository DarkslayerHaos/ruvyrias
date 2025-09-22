import { AppleMusic } from './applemusic';
import { Deezer } from './deezer/Deezer';
import { Spotify } from './spotify';

enum PluginName{
    Deezer = 'Deezer',
    Spotify = 'Spotify',
    AppleMusic = 'AppleMusic',
}

/**
 * Object containing built-in music plugins.
 */
export const Plugin = {
  [PluginName.Deezer]: Deezer,
  [PluginName.Spotify]: Spotify,
  [PluginName.AppleMusic]: AppleMusic,
};