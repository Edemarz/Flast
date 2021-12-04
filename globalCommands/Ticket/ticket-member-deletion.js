const TicketSystem = require("../../models/TicketSystemDB");
const TicketDeletionDB = require("../../models/TicketMemberDeletion");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket-member-deletion")
        .setDefaultPermission(true)
        .setDescription("Changes the ticket deletion system on whether or not member can close their tickets!")
        .addBooleanOption((option) => option.setName("member-deletion").setDescription("Defines whether or not member can close their own ticket!").setRequired(true)),
    category: "Ticket",
    usage: "/ticket-member-deletion <Member Deletion (Boolean)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        if (!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${interaction.user}, You need to have the permission \`MANAGE_GUILD\` to execute this command!`,
                color: "RED",
                footerOne: interaction.guild.name,
                footerTwo: interaction.guild.iconURL({ dynamic: true }),
                thumbnail: interaction.guild.iconURL({ dynamic: true })
            })
        ] });
        
        const CheckingTicketSystem = await TicketSystem.findOne({ GuildID: interaction.guild.id });

        const booleanOption = interaction.options.getBoolean("member-deletion");

        console.log(booleanOption)

        const ErrorSystemNotSettedup = new MessageEmbed()
            .setAuthor(`${interaction.guild.name} Server | Error`)
            .setDescription("This server does not have the ticket system setted up, Please tell an admin to set the ticket system again!")
            .setColor("RED")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        if (!CheckingTicketSystem) return interaction.followUp({ embeds: [ErrorSystemNotSettedup] })

        const CheckingTicketDeletion = await TicketDeletionDB.findOne({ GuildID: interaction.guild.id });

        if (booleanOption) {
            const Changed = new MessageEmbed()
                .setTitle("Ticket Deletion Changed")
                .setDescription(`${interaction.user}, You have setted Ticket Member Deletion to On, Meaning member's can now close their ticket!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            if (CheckingTicketDeletion) {
                return interaction.followUp({ content: "The ticket member deletion is already setted to on!" })
            }

            if (!CheckingTicketDeletion) {
                const newGuild = await new TicketDeletionDB({
                    GuildID: interaction.guild.id
                });

                await newGuild.save()

                return interaction.followUp({ embeds: [Changed] })
            }
        }

        if (!booleanOption) {
            const Changed = new MessageEmbed()
                .setTitle("Ticket Deletion Changed")
                .setDescription(`${interaction.user}, You have setted Ticket Member Deletion to Off, Meaning member's can no longer close their own ticket!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            if (CheckingTicketDeletion) {
                await CheckingTicketDeletion.deleteOne()

                return interaction.followUp({ embeds: [Changed] })
            }

            if (!CheckingTicketDeletion) {
                return interaction.followUp({ content: "The ticket member deletion is already setted to off!" })
            }
        }
    }
}