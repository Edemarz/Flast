const Ytdl = require("ytdl-core");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { NoSubscriberBehavior, joinVoiceChannel, createAudioPlayer, createAudioResource, generateDependencyReport } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("music-play")
    .setDefaultPermission(true)
    .setDescription("Play/Queue a Music!")
    .addStringOption((option) => option.setName("song").setDescription("The song to play/queue!").setRequired(true)),
    category: "Music",
    usage: "/music-play <Song>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const { options, member, user, guild } = interaction;
        const NotInVC = client.createEmbed({
            text: `${user}, You are not in a voice channel! To be able to play music, You need to be in a voice channel!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        if (!member.voice.channel) return interaction.followUp({ embeds: [NotInVC] });

        const queryMusic = options.getString("song");

        const noSong = client.createEmbed({
            text: `${user}, You need to specify a song to play!`,
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true }),
            color: "RED"
        });

        if (!queryMusic) return interaction.followUp({ embeds: [noSong] });

        const music = await client.findVideo(queryMusic);

        const noMusicFound = client.createEmbed({
            text: `${user}, Could not find the music titled **${queryMusic}**!`,
            color: "BLURPLE",
            footerOne: user.tag,
            footerTwo: user.displayAvatarURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        if (!music) return interaction.followUp({ embeds: [noMusicFound] });

        if (!client.queue.get(guild.id)) {
            client.queue.set(guild.id, [{ title: music.title, url: music.url, duration: music.timestamp, views: music.views, thumbnailURL: music.thumbnail }]);

            const connection = await joinVoiceChannel({
                channelId: member.voice.channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });

            client.connection.set(guild.id, connection);

            playAudio(connection, member.voice.channel, { title: music.title, url: music.url, duration: music.timestamp, views: music.views, thumbnailURL: music.thumbnail }, interaction, client, guild);

            const nowPlaying = client.createEmbed({
                text: `Now Playing:\n[${music.title}](${music.url}) - ${music.timestamp} (${music.views?.toLocaleString()} Views)`,
                thumbnail: music.thumbnail,
                color: "BLURPLE",
                footerOne: `Requested by ${user.tag}`,
                footerTwo: guild.iconURL({ dynamic: true })
            });

            return interaction.followUp({ embeds: [nowPlaying] });
        } else {
            client.queue.get(guild.id).push({ title: music.title, url: music.url, duration: music.timestamp, views: music.views, thumbnailURL: music.thumbnail });

            const addedToQueue = client.createEmbed({
                text: `Added to Queue:\n[${music.title}](${music.url}) - ${music.timestamp} (${music.views?.toLocaleString()} Views)`,
                thumbnail: music.thumbnail,
                color: "BLURPLE",
                footerOne: `Added by ${user.tag}`,
                footerTwo: guild.iconURL({ dynamic: true })
            });

            return interaction.followUp({ embeds: [addedToQueue] });
        }
    }
};

var removedElement = [];

const playAudio = async (connection, vc, song, interaction, client, guild) => {
    const song_queue = await client.queue.get(guild.id);

    if (!song && !client.loop.get(guild.id) && !client.queueLoop.get(guild.id)) {
        client.queue.delete(guild.id);
        client.loop.delete(guild.id);
        client.queueLoop.delete(guild.id);
        client.audioPlayer.delete(guild.id);
        const noMoreSongs = client.createEmbed({
            text: "Left the voice channel since there is no more songs playing!",
            color: "BLURPLE",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        })
        connection.destroy()
        interaction.channel.send({ embeds: [noMoreSongs] });
        return
    };

    const downloadedResult = Ytdl(song.url, { filter: 'audioonly' });
    const resource = createAudioResource(downloadedResult, { inlineVolume: true });
    const audioPlayer = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    });

    connection.subscribe(audioPlayer);

    audioPlayer.play(resource);

    client.audioPlayer.set(guild.id, audioPlayer);

    audioPlayer.on('stateChange', (oldState, newState) => {
        if (oldState.status == "playing" && newState.status == "idle") {
            //Loop Section
            if (client.loop.get(guild.id)) {
                return playAudio(connection, vc, song, interaction, client, guild)
            };
            
            // if (client.queueLoop.get(guild.id) && !client.loop.get(guild.id)) {
            //     let actualQueue = client.queue.get(guild.id);
            //     let copyQueue = actualQueue;

            //     if (!copyQueue || copyQueue.length < 1 && removedElement.length >= 1) {
            //         for (const object of removedElement) {
            //             copyQueue.unshift(object)
            //         };
            //     };

            //     const shiftedObject = copyQueue.shift();
            //     removedElement.push(shiftedObject);
            //     const nowPlaying = client.createEmbed({
            //         text: `Now Playing:\n[${copyQueue[0].title}](${copyQueue[0].url}) - ${copyQueue[0].duration} (${copyQueue[0].views?.toLocaleString()} Views)`,
            //         thumbnail: copyQueue[0].thumbnailURL,
            //         color: "BLURPLE",
            //         footerOne: "Played from the queue",
            //         footerTwo: client.user.displayAvatarURL({ dynamic: true })
            //     });

            //     interaction.channel.send({ embeds: [nowPlaying] });

            //     return playAudio(connection, vc, client, copyQueue[0], interaction, client, guild);
            // }
            client.queue.get(guild.id).shift(); //Go to the next song

            const newQueue = client.queue.get(guild.id);

            if (!newQueue || newQueue.length < 1) {
                client.queue.delete(guild.id);
        client.loop.delete(guild.id);
        client.queueLoop.delete(guild.id);
        client.audioPlayer.delete(guild.id);
        const noMoreSongs = client.createEmbed({
            text: "Left the voice channel since there is no more songs playing!",
            color: "BLURPLE",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        })
        connection.destroy()
        interaction.channel.send({ embeds: [noMoreSongs] });
        return
            }
            //Queue Section
            let nowPlaying;
            if (song) {
            nowPlaying = client.createEmbed({
                text: `Now Playing:\n[${newQueue[0].title}](${newQueue[0].url}) - ${newQueue[0].duration} (${newQueue[0].views?.toLocaleString()} Views)`,
                thumbnail: newQueue[0].thumbnailURL,
                color: "BLURPLE",
                footerOne: "Played from the queue",
                footerTwo: client.user.displayAvatarURL({ dynamic: true })
            });
        }

            playAudio(connection, vc, client.queue.get(guild.id)[0], interaction, client, guild)

            return interaction.channel.send({ embeds: [nowPlaying] });
        }
    });

    //Error Handler
    audioPlayer.on('error', (error) => console.log(client.colorText(error)));
}