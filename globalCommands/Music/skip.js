const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("music-skip")
    .setDefaultPermission(true)
    .setDescription("Skip the current playing music!"),
    category: "Music",
    usage: "/music-skip",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const { member, user, guild } = interaction;

        if (!member.voice.channel) return interaction.followUp({ content: `${user}, You need to be in a voice channel to execute this command!` });
        if (!client.queue.get(guild.id)) return interaction.followUp({ content: `${user}, There is currently no song playing/queued!`});
        if (!client.audioPlayer.get(guild.id)) return interaction.followUp({ content: `${user}, There is currently no song playing/queued!`});

        const oldState = {
            status: 'playing'
        };
        const newState = {
            status: 'idle'
        };

        await client.audioPlayer.get(guild.id).emit('stateChange', (oldState, newState));
        
        const firstQueue = client.queue.get(guild.id)[1];

        if (!firstQueue) return;

        const skipped = client.createEmbed({
            text: `${user}, You have skipped the music to:\n[${firstQueue.title}](${firstQueue.url}) - ${firstQueue.duration} (${firstQueue.views?.toLocaleString()} Views)`,
            thumbnail: firstQueue.thumbnail,
            color: "BLURPLE",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true })
        });

        interaction.followUp({ embeds: [skipped] });
    }
}