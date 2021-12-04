const { SlashCommandBuilder } = require("@discordjs/builders");
const { Role, Channel, Message, ButtonInteraction } = require("discord.js");
const TicketDB = require("../../models/TicketSystemDB");
const { MessageEmbed } = require("discord.js");
const messageRegistry = require("../../models/TicketMessageDB");
const { MessageButton, MessageActionRow } = require("discord.js");
const { Permissions } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder() //I warn you fandom ace, DO NOT change ANY of this
        .setName("ticket-setup")
        .setDescription("Setup the ticket system!")
        .setDefaultPermission(true)
        .addStringOption((option) =>
            option.setName("ticket-description").setDescription("The ticket embed description!").setRequired(true))
        .addRoleOption((option) => option.setName("ticket-manager-role").setDescription("Set's the role that have access to manage the ticket! Mention the role!").setRequired(true))
        .addChannelOption((option) => option.setName("ticket-channel").setDescription("The channel (ID only) to send the ticket embed to and binds the ticket embed with the ticket system").setRequired(true))
        .addStringOption((option) => option.setName("ticket-color").setDescription(`Set the ticket embed color (Default is Blurple)[If invalid goes to default]`).setRequired(true))
        .addStringOption((option) => option.setName("ticket-title").setDescription("Set the ticket embed title (Default is Ticket Support)[If invalid goes to default]").setRequired(true)),
    category: "Ticket",
    usage: "/ticket-setup <Ticket Description> <Ticket Manager Role (Role Mention)> <Ticket Channel (Channel Mention)> <Ticket Color (Color Resolvable)> <Ticket Title>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${interaction.user}, You need to have the permission \`MANAGE_GUILD\` to execute this command!`,
                color: "RED",
                footerOne: interaction.guild.name,
                footerTwo: interaction.guild.iconURL({ dynamic: true }),
                thumbnail: interaction.guild.iconURL({ dynamic: true })
            })
        ] });

        const role = await interaction.options.getRole("ticket-manager-role");

        const channel = await interaction.options.getChannel("ticket-channel")

        let title = "Ticket Support"; //Default title;
        let color = "BLURPLE"; //Default Color;

        const checking = await TicketDB.findOne({ GuildID: interaction.guild.id });

        if (["AQUA", "BLUE", "BLURPLE", "DARKER_GREY", "DARK_AQUA", "DARK_BLUE", "DARK_BUT_NOT_BLACK", "DARK_GOLD", "DARK_GREEN", "DARK_GREY", "DARK_NAVY", "DARK_ORANGE", "DARK_PURPLE", "DARK_RED", "DARK_VIVID_PINK", "DEFAULT", "FUCHSIA", "GOLD", "GREEN", "GREY", "GREYPLE", "LIGHT_GREY", "LUMINOUS_VIVID_PINK", "NAVY", "NOT_QUITE_BLACK", "ORANGE", "PURPLE", "RANDOM", "RED", "WHITE", "YELLOW"].includes(interaction.options._hoistedOptions[3].value?.toUpperCase())) color = interaction.options._hoistedOptions[3].value?.toUpperCase();
        if (interaction.options._hoistedOptions[4].value?.toLowerCase() !== "default") title = interaction.options._hoistedOptions[4].value?.toLowerCase();

        if (checking) {
            await checking.deleteOne();

            const newDB = await new TicketDB({
                GuildID: interaction.guild.id,
                Description: interaction.options._hoistedOptions[0].value,
                TicketManager: role.id,
                TicketChannel: channel.id,
                Color: color,
                Title: title
            });

            await newDB.save()
        }

        if (!checking) {
            const newDB = await new TicketDB({
                GuildID: interaction.guild.id,
                Description: interaction.options._hoistedOptions[0].value,
                TicketManager: role.id,
                TicketChannel: channel.id,
                Color: color,
                Title: title
            });

            await newDB.save()
        }

        const ticketEmbed = new MessageEmbed()
            .setTitle(title)
            .setDescription(interaction.options._hoistedOptions[0].value)
            .setColor(color)
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        const btnRow = new MessageActionRow().addComponents(
            new MessageButton()
                .setStyle("PRIMARY")
                .setCustomId("ticket-button")
                .setLabel("Open Ticket")
                .setEmoji("✉️")
        );

        const channelToSend = await interaction.guild.channels.cache.get(channel.id);

        const msg = await channelToSend.send({ embeds: [ticketEmbed], components: [btnRow] });

        const messageDB = await messageRegistry.findOne({ GuildID: interaction.guild.id });

        if (messageDB) {
            await messageDB.deleteOne();

            const newMsg = await new messageRegistry({
                GuildID: interaction.guild.id,
                MessageID: msg.id
            });

            await newMsg.save()
        }

        if (!messageDB) {
            const newMsg = await new messageRegistry({
                GuildID: interaction.guild.id,
                MessageID: msg.id
            });

            await newMsg.save()
        }

        interaction.followUp({ content: "Ticket System setted up! feel free to open a ticket!" })
    }
}