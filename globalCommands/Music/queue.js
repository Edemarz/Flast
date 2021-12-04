const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("music-queue")
    .setDescription("Check the queue of the server!")
    .setDefaultPermission(true),
    category: "Music",
    usage: "/music-queue",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const { member, user, guild } = interaction;
        const meNotInVC = client.createEmbed({
            text: `${user}, I am not in a voice channel!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL(),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        if (!guild.me.voice.channel) return interaction.followUp({ embeds: [meNotInVC] });
        const noQueue = client.createEmbed({
            text: `${user}, This server currently has no songs playing!`,
            color: "BLURPLE",
            footerOne: guild.name,
            footerTwo: guild.iconURL(),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        if (!client.queue.get(guild.id)) return interaction.followUp({ embeds: [noQueue] });

        if (client.queue.get(guild.id).length === 1) { // I rickrolled The Light twice. - Edemarz
            const queue = client.queue.get(guild.id)[0];

            const noTracks = new MessageEmbed()
            .setTitle(`Music Queue (${client.queue.get(guild.id).length - 1} Tracks)`)
            .setDescription(`Now Playing:\n[${queue.title}](${queue.url}) - ${queue.duration} (${queue.views?.toLocaleString()} Views)\n\n\`There is currently no queue, to queue a song do /play <Song>.\``)
            .setThumbnail(queue.thumbnail)
            .setColor("BLURPLE")
            .setFooter(guild.name, guild.iconURL())
            .setTimestamp()

            return interaction.followUp({ embeds: [noTracks] })
        };

        const increment = (function (n) {
            return function () {
                n += 1;
                return n;
            }
        }(0));

        const firstSong = client.queue.get(guild.id)[0];
        const normalQueue = client.queue.get(guild.id);

        let shiftedQueue;

        shiftedQueue = normalQueue;

        const shiftedElement = await shiftedQueue.shift()

        const musicQueue = new MessageEmbed()
        .setTitle(`Music Queue (${normalQueue.length - 1} Tracks)`)
        .setDescription(`Now Playing:\n[${firstSong.title}](${firstSong.url}) - ${firstSong.duration} (${firstSong.views?.toLocaleString()} Views)\n\n${(shiftedQueue).map((song) => `${increment()?.toLocaleString()}. [${song.title}](${song.url}) - ${song.duration} (${song.views?.toLocaleString()} Views)`)}`)
        .setColor("BLURPLE")
        .setTimestamp()
        .setFooter(`Requested by ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))

        interaction.followUp({ embeds: [musicQueue] });

        await shiftedQueue.unshift(shiftedElement)
    }
}