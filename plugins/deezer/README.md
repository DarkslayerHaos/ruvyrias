# Installation

```
// Just import the class from Ruvyrias
const { Plugin } = require('ruvyrias');
```
## Example usage basic bot

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const { Plugin, LibrariesType, PlatformsType } = require('ruvyrias');
const deezer = new Plugin.Deezer();

const RuvyriasOptions = {
    library: LibrariesType.DiscordJS,
    defaultPlatform: PlatformsType.YtSearch,
    plugins: [deezer], 
};

const nodes = [
    {
        name: 'local-node',
        host: 'localhost',
        port: 2333,
        password: 'youshallnotpass',
    },
];

// The entire code of a bot can be found at the main page, i'll not repeat all things here
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
});

client.ruvyrias = new Ruvyrias(client, nodes, RuvyriasOptions);

/**
 * You can use the source property to search by name or it will use the defaultPlatform to search by name
 * Links will work directly, and it serves to any platform, but plugins has to be loaded before (unless you have lavaSrc)
 */
const res = await client.ruvyrias.resolve({ query: 'alan walker alone', source: 'dzsearch', requester: message.author });
```