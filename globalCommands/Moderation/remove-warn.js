const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
const DB = require("../../models/WarnDB");
const functions = require("../../GlobalFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove-warn")
        .setDefaultPermission(true)
        .setDescription("Remove the warn of a member")
        .addStringOption((option) => option.setName("warning-id").setDescription("The warning to remove using the Warning ID!").setRequired(true)),
    category: "Moderation",
    usage: "/remove-warn <Warning ID>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { guild, member, user, options, channel } = interaction;

        await functions.ValidatePermissions({
            Flag: Permissions.FLAGS.MANAGE_GUILD,
            flagName: "MANAGE_GUILD",
            member: member,
            user: user,
            interaction: interaction
        });

        const generalId = options.getString("warning-id");

        const userId = generalId.split('-')[0];

        const DBCheck = await DB.findOne({
            GuildID: guild.id,
            UserID: userId
        });

        if (!DBCheck) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, There is no warns with the Warning ID: ${generalId}!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const warningToRemove = await DBCheck.Warns.findIndex((warnings) => warnings.warningId == generalId);

        console.log(warningToRemove)

        if (warningToRemove?.toString() == "-1") return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, There is no warns with the Warning ID: ${generalId}!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        if (warningToRemove?.toString() == "0") {
            const data = DBCheck.Warns[warningToRemove];
            await DBCheck.Warns.splice(warningToRemove, warningToRemove + 1);
            await DBCheck.updateOne({
                GuildID: guild.id,
                UserID: user.id,
                Warns: DBCheck.Warns,
                Amount: DBCheck.Amount - 1
            });

            const removedWarn = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Remove Warn`, guild.iconURL({ dynamic: true }))
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You have successfuly removed the warning with the ID: ${generalId}\n\`\`\`js\nModerator: ${data.moderator}\nReason: ${data.reason}\nWarned At: ${data.warnedAt}\nWarning ID: ${data.warningId}\n\`\`\``)

            return interaction.followUp({ embeds: [removedWarn] });
        }

        if (warningToRemove) {
            const data = DBCheck.Warns[warningToRemove];
            await DBCheck.Warns.splice(warningToRemove, warningToRemove + 1);
            await DBCheck.updateOne({
                GuildID: guild.id,
                UserID: user.id,
                Warns: DBCheck.Warns,
                Amount: DBCheck.Amount - 1
            });

            const removedWarn = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Remove Warn`, guild.iconURL({ dynamic: true }))
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You have successfuly removed the warning with the ID: ${generalId}\n\`\`\`js\nModerator: ${data.moderator}\nReason: ${data.reason}\nWarned At: ${data.warnedAt}\nWarning ID: ${data.warningId}\n\`\`\``)

            return interaction.followUp({ embeds: [removedWarn] });
        }
    }
}