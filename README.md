<p align='center'>
  <img src='https://images.wallpaperscraft.com/image/single/girl_umbrella_anime_151317_1600x1200.jpg' />
</p>

# <p align='center'>Note: This version supports only Lavalink V4 or above.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ruvyrias">
    <img src="https://img.shields.io/npm/v/ruvyrias" alt="npm"/>
  </a>
  <img src="https://img.shields.io/github/issues-raw/DarkslayerHaos/ruvyrias" alt="GitHub issues"/>
  <img src="https://img.shields.io/npm/l/ruvyrias" alt="NPM"/>
</p>

<p align="center">
  <a href="https://nodei.co/npm/ruvyrias/">
    <img src="https://nodei.co/npm/ruvyrias.png?downloads=true&downloadRank=true&stars=true" alt="Ruvyrias NPM Package"/>
    </a>
</p>

## Table of contents

- [Documentation](https://ruvyrias-lock.vercel.app/)
- [Installation](#installation)
- [About](#about)
- [Implementation Repositories](#implementation-repositories)
- [Basic Usage](#basic-usage)
- [Bot Example](#bot-example)

## Installation

```bash
# Using npm
npm install ruvyrias

# Using yarn
yarn add ruvyrias
```

## About

To use, you need a configured [Lavalink](https://github.com/lavalink-devs/Lavalink) instance.

Ruvyrias is a robust Discord music bot client tailored for Lavalink V4 and above. Key features include:

- **Stability:** A reliable and smooth client experience.
- **TypeScript Support:** Enhanced development with TypeScript.
- **Lavalink Compatibility:** 100% compatible with Lavalink version 4 and above.
- **Object-Oriented:** Organized and maintainable code.
- **Customizable:** Adapt the client to your bot preferences.
- **Easy Setup:** Quick and hassle-free installation.
- **Queue System:** Efficiently manage music playback.
- **Platform Support:** Built-in compatibility with Youtube, Soundcloud, Spotify, Apple Music, and Deezer.

## Implementation Repositories
Note: `Send PR to add your repository here.`

| Repository                                                             | Creator                                             | Additional Information                              |
| ---------------------------------------------------------------------- | ----------------------------------------------------| ----------------------------------------------------|
| [Ruvyrias Example](https://github.com/DarkslayerHaos/ruvyrias-example) | [DarkslayerHaos](https://github.com/DarkslayerHaos) | Official Ruvyrias Exampe Bot, easy setup and usage. |
| [Lunox](https://github.com/adh319/Lunox/tree/Lavalink_v4)              | [adh319](https://github.com/adh319)                 | Check out the repository for futher information.    |

## Basic Usage

```js
// Import necessary modules.
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { Ruvyrias } = require('ruvyrias');

// Define Lavalink nodes configuration.
const nodes = [
    {
        name: 'main',
        host: 'localhost',
        port: 2333,
        password: 'youshallnotpass',
    },
];

// Define options for Ruvyrias client.
const RuvyriasOptions = {
    library: 'discord.js',
    defaultPlatform: 'ytsearch',
    reconnectTries: Infinity,
    reconnectTimeout: 1000 * 10,
};

// Initialize Discord client with necessary intents.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
});

// Create Ruvyrias instance and bind it to the client.
client.ruvyrias = new Ruvyrias(client, nodes, RuvyriasOptions);

// Event handler for when the bot is ready.
client.on('ready', (client) => {
    console.log(`[+] Logged in as: ${client.user?.tag}`);
    client.ruvyrias.init(client);

    client.user.setActivity({ name: '!play', type: ActivityType.Listening })
});

// Event handler for message creation.
client.on('messageCreate', async (message) => {
    // Ignore messages that are from bots.
    if (message.author.bot) return;

    // Extract command and arguments from the message
    const args = message.content.slice(1).trim().split(/ +/g);
    const command = args.shift()?.toLowerCase()

    if (command === '!play') {
        const query = args.join(' ');

        // Creating the Player.
        const player = client.ruvyrias.createConnection({
            guildId: message.guildId,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channelId,
            deaf: true,
            mute: false
        });

        const resolve = await client.ruvyrias.resolve({ query, requester: message.author });
        const { loadType, tracks, playlistInfo } = resolve;

        // Handle errors or empty responses.
        if (loadType === 'error' || loadType === 'empty') {
            return message.reply({ embeds: [{ description: `❌ An error occurred, please try again!`, color: Colors.Red }] });
        }

        // Handle playlist loading.
        if (loadType === 'playlist') {
            for (const track of tracks) {
                player.queue.add(track);
            }

            if (!player.playing && !player.paused) return player.play();
            return message.reply(`🎶 [${playlistInfo?.name}](${query}) with \`${tracks.length}\` tracks added.`);
        } 
        // Handle single track or search results loading.
        else if (loadType === 'search' || loadType === 'track') {
            const track = tracks[0];
            player.queue.add(track);

            if (!player.playing && !player.paused) return player.play();
            return message.channel.send(`🎶 \`${track.info.title}\` added to queue.`);
        }
    }
});

// Runs when a Lavalink Node is successfully connected.
client.ruvyrias.on('nodeConnect', node => {
    console.log(`[+] Node ${node.name} connected.`)
});

// Runs when a new track starts playing in the music player.
client.ruvyrias.on('trackStart', (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);

    channel.send(`🎶 Now playing: \`${track.info.title}\` by \`${track.info.author}\`.`);
});

// Runs when the music playlist reaches the end and the music player leaves the voice channel.
client.ruvyrias.on('queueEnd', player => {
    player.stop();

    const channel = client.channels.cache.get(player.textChannel);
    channel.send('⛔ The player queue has ended, i\'m leaving voice channal!');
});

// Log in the bot using the provided token.
client.login('token');
```

## Bot Example

If you're looking for a practical example of how to use Ruvyrias, check out the [Ruvyrias Example Bot](https://github.com/DarkslayerHaos/ruvyrias-example). This repository provides a complete bot and sample code to help you get started quickly.

The example bot comes with several commands to manage music playback seamlessly:

| Command                         | Description                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| `.play <link or song-name>`     | Play a song by providing a link or the name of the song.              |
| `.pause`                        | Pause the currently playing track.                                    |
| `.resume`                       | Resume playback.                                                      |
| `.skip`                         | Skip to the next track in the queue.                                  |
| `.stop`                         | Stop the music and clear the queue.                                   |
| `.queue`                        | Display the current music queue.                                      |
| `.playprevious`                 | Play the previously played track.                                     |
| `.loop`                         | Toggle loop mode for the entire queue.                                |
| `.bassboost`                    | Enhance the bass of the music.                                        |
| `.save`                         | Save the currently playing track and send the link in DM to the user. |
| `.volume <1-100>`               | Adjust the volume of the music.                                       |

## Credits

The [Ruvyrias](https://github.com/DarkslayerHaos/ruvyrias) client, customized by [DarkslayerHaos](https://github.com/DarkslayerHaos), is a fork originally derived from the code of [Poru](https://github.com/parasop/poru) developed by [Parasop](https://github.com/parasop).
