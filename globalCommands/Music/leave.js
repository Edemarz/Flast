const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("music-leave")
    .setDefaultPermission(true)
    .setDescription("Leaves the voice channel and clears the queue!"),
    category: "Music",
    usage: "/leave",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const { user, guild, member } = interaction;
        const notInVc = client.createEmbed({
            text: `${user}, You need to be in a voice channel to execute this command`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: user.displayAvatarURL({ dynamic: true })
        });

        if (!member.voice.channel) return interaction.followUp({ embeds: [notInVc] });
        if (!client.connection.get(guild.id)) return interaction.followUp({ content: `${user}, A connection hasn't been made!` });

        client.connection.get(guild.id).destroy();

        const embedYes = client.createEmbed({
            text: `${user}, Left the voice channel and cleared the queue along side with loop!`,
            color: "BLURPLE",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: user.displayAvatarURL({ dynamic: true })
        })

        interaction.followUp({ embeds: [embedYes] })
    }
}