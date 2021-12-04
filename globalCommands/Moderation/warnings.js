const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require("../../models/WarnDB");
const { MessageEmbed, Permissions } = require("discord.js");
const pev = require("../../GlobalFunctions");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("warnings")
    .setDefaultPermission(true)
    .setDescription("Check/View a user warnings!")
    .addUserOption((option) => option.setName("user").setDescription("The user to check/view the warning of!").setRequired(true)),
    usage: "/warnings <User (Mention)>",
    category: "Moderation",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { options, user, guild, member } = interaction;

        await pev.ValidatePermissions({
            interaction: interaction,
            member: member,
            user: user,
            Flag: Permissions.FLAGS.MANAGE_GUILD,
            flagName: "MANAGE_GUILD"
        });

        const target = options.getUser("user");

        const DBCheck = await DB.findOne({
            GuildID: guild.id,
            UserID: user.id
        });

        if (!DBCheck) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The member <@${target.id}> does not have any warnings!`,
                color: "BLURPLE",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const warns = new MessageEmbed()
        .setAuthor(`${target.tag} Warns | ${guild.name} Server`, target.displayAvatarURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setTimestamp()
        .setDescription((DBCheck.Warns).map((warnings) => `\`\`\`js\nModerator: ${warnings.moderator}\nReason: ${warnings.reason}\nWarned At: ${warnings.warnedAt}\nWarning ID: ${warnings.warningId}\n\`\`\``).join('\n').toString())
        .setColor("AQUA")

        return interaction.followUp({ embeds: [warns] });
    }
}