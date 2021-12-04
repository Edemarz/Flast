const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const TicketDB = require("../../models/TicketDB");
const TicketSystemDB = require("../../models/TicketSystemDB");
const ExtraUser = require("../../models/extraTicketUser");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket-add")
        .setDefaultPermission(true)
        .setDescription("Add a user to a ticket!")
        .addUserOption((option) => option.setName("user").setDescription("User to add to the ticket!").setRequired(true))
        .addChannelOption((option) => option.setName("ticket-channel").setRequired(true).setDescription("The ticket to add the user to!")),
    category: "Ticket",
    perm: "Manage Guild",
    usage: "/ticket-add <User (Mention)> <Ticket (Channel Mention)>",
    async execute(client, interaction, Discord) {
        const { member, user, guild } = interaction
        if (interaction.member.permissions.has("MANAGE_GUILD")) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You need to have the permissions \`MANAGE_GUILD\` to execute the command!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const channel = await interaction.options.getChannel("ticket-channel");
        const userToAdd = await interaction.options.getUser("user");

        if (userToAdd.id === interaction.user.id) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You cannot add yourself to your own Ticket Extra User!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const TicketSystemCheck = await TicketSystemDB.findOne({ GuildID: interaction.guild.id });

        const ErrorSystemNotSettedup = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Ticket-Add`)
            .setDescription("This server does not have the ticket system setted up, Please tell an admin to set the ticket system again!")
            .setColor("RED")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))

        if (!TicketSystemCheck) return interaction.followUp({ embeds: [ErrorSystemNotSettedup] });

        const CheckingTicket = await TicketDB.findOne({ GuildID: interaction.guild.id, ChannelID: channel.id });

        const ErrorNotValidTicket = new MessageEmbed()
            .setTitle(`${guild.name} Server | Ticket-Add`)
            .setDescription(`The channel you entered (<#${channel.id}>) is not a ticket!`)
            .setColor("RED")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        if (!CheckingTicket) return interaction.followUp({ embeds: [ErrorNotValidTicket] });

        const errorNotAllowed = new MessageEmbed()
            .setAuthor(`${interaction.guild.name} Server | Error`)
            .setDescription(`You cannot add the user <@${userToAdd.id}> cause it's the user who opened the ticket!`)
            .setColor("RED")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        if (userToAdd.id === CheckingTicket.User) return interaction.followUp({ embeds: [errorNotAllowed] })

        const ticketChannel = await interaction.guild.channels.cache.get(CheckingTicket.ChannelID);

        await ticketChannel.permissionOverwrites.create(userToAdd, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            ADD_REACTIONS: true
        });

        const extraUserCheck = await ExtraUser.findOne({ GuildID: interaction.guild.id, Ticket: channel.id });

        const addedUser = new MessageEmbed()
            .setTitle("User Added")
            .setDescription(`Added the user <@${userToAdd.id}> to the ticket as an ExtraUser!`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        if (extraUserCheck) {
            const alreadyAnExtraUser = new MessageEmbed()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${userToAdd} is already added to the ticked as an Extra User!`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            let double = false;

            extraUserCheck.ExtraUser.forEach((array) => {
                if (array === userToAdd.id) double = true;
            });

            if (double === true || double) return interaction.followUp({ embeds: [alreadyAnExtraUser] })

            await extraUserCheck.ExtraUser.push(userToAdd.id)
            await extraUserCheck.updateOne({
                GuildID: interaction.guild.id,
                Ticket: extraUserCheck.Ticket,
                TicketOwner: extraUserCheck.TicketOwner,
                ExtraUser: extraUserCheck.ExtraUser,
                AmountOfExtraUser: extraUserCheck.AmountOfExtraUser + 1
            });

            return interaction.followUp({ embeds: [addedUser] })
        }

        if (!extraUserCheck) {
            const newData = await new ExtraUser({
                GuildID: interaction.guild.id,
                Ticket: channel.id,
                TicketOwner: CheckingTicket.User,
                ExtraUser: [userToAdd.id],
                AmountOfExtraUser: 1
            });

            await newData.save()

            return interaction.followUp({ embeds: [addedUser] })
        }
    }
}