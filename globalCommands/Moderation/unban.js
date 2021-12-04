const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
const func = require("../../GlobalFunctions");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("unban")
    .setDefaultPermission(true)
    .setDescription("Unban a user from the server, if banned!")
    .addStringOption((option) => option.setName("user-id").setDescription("The user to ban using the User ID!").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("The reason why this user is unbanned! [Optional]")),
    category: "Moderation",
    usage: "/unban <User (ID)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { options, member, user, guild } = interaction;

        await func.ValidatePermissions({
            Flag: Permissions.FLAGS.MANAGE_GUILD,
            flagName: "Manage Guild",
            interaction: interaction,
            member: member,
            user: user
        });

        const userID = options.getString("user-id");

        let failed = false;

        let reason;

        let testReason = options.getString("reason");

        if (testReason) reason = testReason;

        await guild.members.unban(userID).catch((err) => {
            failed = true;
            const invalidUserID = client.createEmbed({
                text: `${user}, The User ID must be made out of Numbers! Error Code: 50035`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            });

            const userNotFound = client.createEmbed({
                text: `${user}, That user is not banned! Error Code: 10026`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            });

            const invalidUser = client.createEmbed({
                text: `${user}, That User ID does not belong to any User! Error Code: 10013`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            });

            if (err.code === 50035) return interaction.followUp({ embeds: [invalidUserID] });
            if (err.code === 10026) return interaction.followUp({ embeds: [userNotFound] });
            if (err.code === 10013) return interaction.followUp({ embeds: [invalidUser] });
        });

        if (failed) return;

        const UnbannedWOOO = new MessageEmbed()
        .setAuthor(`${guild.name} | Unban`, guild.iconURL({ dynamic: true }))
        .setDescription(`${user}, You have unbanned the user with the User ID: ${userID} for **${reason ? reason : "No Reason Provided"}**!`)
        .setColor("BLURPLE")
        .setTimestamp()
        .setFooter(`${client.user.username} / The best discord bot`, client.user.displayAvatarURL({ dynamic: true }))

        interaction.followUp({ embeds: [UnbannedWOOO] });
    }
}