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
- [Basic Usage](#basic-usage)
- [Bot Example](https://github.com/DarkslayerHaos/ruvyrias-example)

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

- **Rock-Solid Stability:** Handles heavy loads without hiccups, ensuring uninterrupted music playback.
- **Full TypeScript Support:** Enjoy type safety, autocompletion, and robust development experience.
- **Lavalink V4+ Ready:** Optimized for the latest Lavalink version, leveraging all new features.
- **Clean Object-Oriented Architecture:** Easy to extend, maintain, and integrate into any bot project.
- **Advanced Queue Management:** Sophisticated control over tracks, playlists, and playback order.
- **Multi-Platform Support:** Seamlessly stream from YouTube, Spotify, SoundCloud, Apple Music, and Deezer.
- **Developer-Friendly:** Minimal setup, clear API, and built to empower bot creators with full control.

## Basic Usage

```js
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { Ruvyrias } = require('ruvyrias');

const RuvyriasOptions = {
    library: 'discord.js',
    defaultPlatform: 'ytsearch',
    autoResume: true,
    reconnectTries: Infinity,
    reconnectTimeout: 1000 * 10,
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
});

client.ruvyrias = new Ruvyrias(client, 
    [{
        name: 'main',
        host: 'localhost',
        port: 2333,
        password: 'youshallnotpass',
        secure: false,
        resume: true,
    }],
    ,{
        library: 'discord.js',
        defaultPlatform: 'ytsearch',
        autoResume: true,
        reconnectTries: Infinity,
        reconnectTimeout: 1000 * 10,
});

client.on('ready', (client) => {
    console.log(`[+] Logged in as: ${client.user?.tag}`);
    client.ruvyrias.init(client);

    client.user.setActivity({ name: '!play', type: ActivityType.Listening })
});

client.on('messageCreate', async (message) => {
    if (!message.content.toLowerCase().startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/g);
    const command = args.shift()?.toLowerCase()

    if (command === 'play') {
        const query = args.join(' ');

        const player = client.ruvyrias.createConnection({
            guildId: message.guildId,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channelId,
            deaf: true,
            mute: false
        });

        const resolve = await client.ruvyrias.resolve({ query, requester: message.author });
        const { loadType, tracks, playlistInfo } = resolve;

        if (loadType === 'error' || loadType === 'empty') {
            return message.reply({ embeds: [{ description: `❌ An error occurred, please try again!`, color: Colors.Red }] });
        }

        if (loadType === 'playlist') {
            for (const track of tracks) {
                player.queue.add(track);
            }

            if (!player.playing && !player.paused) return player.play();
            return message.reply(`🎶 [${playlistInfo?.name}](${query}) with \`${tracks.length}\` tracks added.`);
        } 
        else if (loadType === 'search' || loadType === 'track') {
            const track = tracks[0];
            player.queue.add(track);

            if (!player.playing && !player.paused) return player.play();
            return message.channel.send(`🎶 \`${track.info.title}\` added to queue.`);
        }
    }
});

client.ruvyrias.on('nodeConnect', node => {
    console.log(`[+] Node ${node.options.name} connected.`)
});

client.ruvyrias.on('trackStart', (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);

    channel.send(`🎶 Now playing: \`${track.info.title}\` by \`${track.info.author}\`.`);
});

client.ruvyrias.on('queueEnd', player => {
    player.stop();

    const channel = client.channels.cache.get(player.textChannel);
    channel.send('⛔ The player queue has ended, i\'m leaving voice channal!');
});

client.login('token');
```

## Credits

The [Ruvyrias](https://github.com/DarkslayerHaos/ruvyrias) client is a fork originally derived from the code of [Poru](https://github.com/parasop/poru).