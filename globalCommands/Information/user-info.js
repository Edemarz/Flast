const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("user-info")
    .setDefaultPermission(true)
    .setDescription("Get information about a specific user!")
    .addUserOption((option) => option.setName("user").setDescription("The user to view the information!").setRequired(true)),
    category: "Information",
    usage: "/user-info <User (Mention)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const { options, guild, member, user } = interaction;

        const target = options.getUser("user");

        const userObject = guild.members.cache.get(target.id);

        let userFlags = [];

        if (target.flags) {
        for (const flags of target.flags) {
            let normFlag = `${flags}`.split('_');

            let join1 = normFlag[0].substring(0, 1);
            let join1Rrest = normFlag[0].substring(1, normFlag[0].length);
            let join2 = normFlag[1].substring(0, 1);
            let join2Rrest = normFlag[1].substring(1, normFlag[1].length);

            const allJoined = `${join1?.toUpperCase()}${join1Rrest?.toLowerCase()} ${join2?.toUpperCase()}${join2Rrest?.toLowerCase()} Badge\n`;

            userFlags.push(allJoined)
        }
        };

        const TargetInfo = new MessageEmbed()
        .setAuthor(`${target.tag} Information | ${guild.name} Server`, target.displayAvatarURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setTimestamp()
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setDescription(`Username: ${target.username}\nDiscriminator: ${target.discriminator}\nIs Bot: ${target.bot ? "Yes" : "No"}\nAccount Created At: ${new Date(target.createdTimestamp).toLocaleDateString()} | Format: DD/MM/YY\n
        User ID: ${target.id}\nUser Badges: ${userFlags ? userFlags : "No Badges"}\nJoined Server At: ${new Date(userObject.joinedTimestamp).toLocaleDateString()} | Format: DD/MM/YY\n
        Avatar: [Click Me!](${target.displayAvatarURL({ dynamic: true })})`)

        return interaction.followUp({ embeds: [TargetInfo] });
    }
}