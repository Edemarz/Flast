//Destructuring & Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require("../../models/VerificationSystem");
const ValidatePermission = require("../../Functions/ValidatePermission");
const { Permissions, MessageEmbed } = require("discord.js");
const DBMessage = require("../../models/VerificationMessage");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("set-verification-system")
    .setDefaultPermission(true)
    .setDescription("Set the Server Verification System")
    .addChannelOption((option) => option.setName("verification-channel").setDescription("The channel where users need to verify!").setRequired(true))
    .addRoleOption((option) => option.setName("verification-role").setDescription("The role to give after the user has verified!").setRequired(true))
    .addStringOption((option) => option.setName("verification-type").setDescription("The verification type, Select one!")
    .addChoice("Text-Based-Verification", "text-ver")
    .addChoice("Reaction-Based-Verification", "react-ver")
    .setRequired(true)),
    category: "Settings",
    usage: "/set-verification-system <Verification Channel (Mention)> <Verification Role (Mention)> <Verification Type (Select One)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { options, guild, user, member } = interaction;
        //Validating Member's Permission
        await ValidatePermission({
            Flag: Permissions.FLAGS.MANAGE_GUILD,
            flagName: "MANAGE_GUILD",
            user: user,
            member: member,
            interaction: interaction
        });
        //Getting Options
        const channel = options.getChannel("verification-channel");
        const role = options.getRole("verification-role");
        const VerificationType = options.getString("verification-type");
        let updatedType;

        if (VerificationType === "text-ver") updatedType = "text-based";
        if (VerificationType === "react-ver") updatedType = "react-based";
        //Checking MongoDB for the Server VerificationSystem DB!
        const CheckingDB = await DB.findOne({
            GuildID: guild.id
        });
        //Command System
        const updatedDB = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Verification`, guild.iconURL({ dynamic: true }))
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setTimestamp()
        .setDescription(`${user}, You have successfuly setted/updated the Verification Channel to <#${channel.id}> and updated the Verification Role to <@&${role.id}> along with the Verification Type to a ${(updatedType === "text-based") ? "Text Based Verification System!" : (updatedType === "react-based") ? "Reaction Base Verification System" : "Internal Error"}`)

        if (CheckingDB) {
            await CheckingDB.updateOne({
                GuildID: guild.id,
                VerificationChannel: channel.id,
                VerificationRole: role.id,
                VerificationType: { type: updatedType }
            });

            interaction.followUp({ embeds: [updatedDB] });
        };

        if (!CheckingDB) {
            new DB({
                GuildID: guild.id,
                VerificationChannel: channel.id,
                VerificationRole: role.id,
                VerificationType: { type: updatedType }
            }).save()

            interaction.followUp({ embeds: [updatedDB] });
        }

        if (updatedType === "text-based") {
            const VerifyNow = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Verification`, guild.iconURL({ dynamic: true }))
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setDescription(`Please send a message containing exactly \`I agree to be a member of ${guild.name}\` (Capitals Letter Included) to verify!`)

            await channel.send({ embeds: [VerifyNow] });
            return
        };

        if (updatedType === "react-based") {
            const VerifyNow = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Verification`, guild.iconURL({ dynamic: true }))
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setDescription(`Please react to this message to verify!`)

            const msg = await channel.send({ embeds: [VerifyNow] });

            await new DBMessage({
                GuildID: guild.id,
                MessageID: msg.id
            }).save()

            await msg.react("⭐");
            return
        };
    }
}