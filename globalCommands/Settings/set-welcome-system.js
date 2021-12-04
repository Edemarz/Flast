//Global Destructuring Constants
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");
//MongoDB
const DB = require("../../models/WelcomeDB");
//Export Command
module.exports = {
    data: new SlashCommandBuilder() //Build the command!
    .setName("set-welcome-system")
    .setDefaultPermission(true)
    .setDescription("Set the welcome system for the server!")
    .addChannelOption((option) => option.setName("channel").setDescription("The channel to send the Welcome Card to!").setRequired(true))
    .addRoleOption((option) => option.setName("role").setDescription("The role to give to a user when they join!").setRequired(true)),
    category: "Settings",
    usage: "/set-welcome-system <Channel (Mention)> <Role (Mention)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        //Destructure Interaction
        const { member, user, guild, options } = interaction;
        //Permission Validation
        const ValidatePermission = require("../../Functions/ValidatePermission");

        await ValidatePermission({
            interaction: interaction,
            Flag: Permissions.FLAGS.MANAGE_GUILD,
            flagName: "MANAGE_GUILD",
            user: user,
            member: member
        });
        //Getting the Options
        const ChannelOption = options.getChannel("channel");
        const RoleOption = options.getRole("role");
        //Checking the MongoDB & Setting One
        const CheckingDB = await DB.findOne({
            GuildID: guild.id
        });

        if (CheckingDB) {
            await CheckingDB.updateOne({
                GuildID: guild.id,
                RoleID: RoleOption.id,
                ChannelID: ChannelOption.id
            });

            return interaction.followUp({ embeds: [
                client.createEmbed({
                    text: `${user}, You have updated the Welcome Channel to <#${ChannelOption.id}> and the Welcome Role to <@&${RoleOption.id}>!`,
                    color: "BLURPLE",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ]})
        };

        if (!CheckingDB) {
            await new DB({
                GuildID: guild.id,
                RoleID: RoleOption.id,
                ChannelID: ChannelOption.id
            }).save();

            return interaction.followUp({ embeds: [
                client.createEmbed({
                    text: `${user}, You have setted the Welcome Channel to <#${ChannelOption.id}> and the Welcome Role to <@&${RoleOption.id}>!`,
                    color: "BLURPLE",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ]})
        }
    }
}