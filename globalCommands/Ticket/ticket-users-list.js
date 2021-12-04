const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, InteractionWebhook, Message } = require("discord.js");
const TicketDB = require("../../models/TicketDB");
const TicketSystemDB = require("../../models/TicketSystemDB");
const ExtraUser = require("../../models/extraTicketUser");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket-users-list")
        .setDescription(`List's all the Ticket Users (including ExtraUsers).`)
        .setDefaultPermission(true)
        .addChannelOption((option) => option.setName("ticket-channel").setDescription("The ticket to list the Ticket Users which includes ExtraUsers!").setRequired(true)),
    category: "Ticket",
    usage: "/ticket-users-list <Ticket Channel (Channel Mention)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const channel = await interaction.options.getChannel("ticket-channel");

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

        const checkingExtraUser = await ExtraUser.findOne({ GuildID: interaction.guild.id, Ticket: channel.id });

        const NoExtraUsers = new MessageEmbed()
            .setTitle("Ticket Users List (Including ExtraUsers)")
            .setDescription(`Ticket Users:\n<@${CheckingTicket.User}>\nTicket ExtraUsers:\nNone`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        if (!checkingExtraUser) return interaction.followUp({ embeds: [NoExtraUsers] });

        const increment = (function (n) {
            return function () {
                n += 1;
                return n;
            }
        }(0));

        if (checkingExtraUser) {
            const ExtraUsersEmbed = new MessageEmbed()
                .setTitle("Ticket Users List (Including ExtraUsers)")
                .setDescription(`Ticket Users:\n<@${CheckingTicket.User}>\nTicket ExtraUsers:\n${(checkingExtraUser.ExtraUser).map((user) => `${increment()}. <@${user}>`)}`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            return interaction.followUp({ embeds: [ExtraUsersEmbed] })
        }
    }
}