const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, InteractionWebhook } = require("discord.js");
const TicketDB = require("../../models/TicketDB");
const TicketSystemDB = require("../../models/TicketSystemDB");
const ExtraUser = require("../../models/extraTicketUser");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket-remove")
        .setDescription("Remove a user from the ticket ExtraUser if added!")
        .setDefaultPermission(true)
        .addUserOption((option) => option.setName("user").setDescription("The user to remove from the ticket ExtraUser, if added.").setRequired(true))
        .addChannelOption((option) => option.setName("ticket-channel").setDescription("The ticket to remove the user from, if added.").setRequired(true)),
    category: "Ticket",
    usage: "/ticket-remove <User (User Mention)> <Ticket Channel (Channel Mention)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        if (interaction.member.permissions.has("MANAGE_GUILD")) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${interaction.user}, You need to have the permission \`MANAGE_GUILD\` to execute this command!`,
                color: "RED",
                footerOne: interaction.guild.name,
                footerTwo: interaction.guild.iconURL({ dynamic: true }),
                thumbnail: interaction.guild.iconURL({ dynamic: true })
            })
        ] });
        
        const channel = await interaction.options.getChannel("ticket-channel");
        const userToAdd = await interaction.options.getUser("user");

        if (userToAdd.id === interaction.user.id) return interaction.followUp({ content: `${interaction.user}, You cannot add your self to a to your own Ticket ExtraUser` })

        const TicketSystemCheck = await TicketSystemDB.findOne({ GuildID: interaction.guild.id });

        const ErrorSystemNotSettedup = new MessageEmbed()
            .setAuthor(`${interaction.guild.name} Server | Error`)
            .setDescription("This server does not have the ticket system setted up, Please tell an admin to set the ticket system again!")
            .setColor("RED")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        if (!TicketSystemCheck) return interaction.followUp({ embeds: [ErrorSystemNotSettedup] });

        const CheckingTicket = await TicketDB.findOne({ GuildID: interaction.guild.id, ChannelID: channel.id });

        const ErrorNotValidTicket = new MessageEmbed()
            .setAuthor(`${interaction.guild.name} Server | Error`)
            .setDescription(`The channel you entered (<#${channel.id}>) is not a ticket!`)
            .setColor("RED")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        if (!CheckingTicket) return interaction.followUp({ embeds: [ErrorNotValidTicket] });

        const ExtraUserCheck = await ExtraUser.findOne({
            GuildID: interaction.guild.id,
            Ticket: channel.id
        });

        const NoExtraUserWithTheChannelID = new MessageEmbed()
            .setAuthor(`${interaction.guild.name} Server | Error`)
            .setDescription(`There is no ExtraUser in the ticket <#${CheckingTicket.ChannelID}>!`)
            .setColor("RED")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        if (!ExtraUserCheck) return interaction.followUp({ embeds: [NoExtraUserWithTheChannelID] })

        const ErrorNotInExtraUser = new MessageEmbed()
            .setAuthor(`${interaction.guild.name} Server | Error`)
            .setDescription(`The user (<@${userToAdd.id}>) you tried to remove from the Ticket ExtraUser, does not exist in the Ticket ExtraUser in the first place.`)
            .setColor("RED")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        if (!ExtraUserCheck.ExtraUser.includes(userToAdd.id)) return interaction.followUp({ embeds: [ErrorNotInExtraUser] });

        const ticketChannel = await interaction.guild.channels.cache.get(CheckingTicket.ChannelID);

        await ticketChannel.permissionOverwrites.delete(userToAdd, `Removed from the ExtraUser by ${interaction.user.tag}`);

        await ExtraUserCheck.deleteOne(); //Delete the extra user check from the Database;

        const RemovedFromExtraUser = new MessageEmbed()
            .setTitle("User Removed")
            .setDescription(`${interaction.user}, You have successfuly removed <@${userToAdd.id}> from the Ticket ExtraUser, meaning that he can now not see the Ticket!`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        interaction.followUp({ embeds: [RemovedFromExtraUser] })
    }
}