const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");
const TicketDB = require("../../models/TicketDB");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket-list")
        .setDefaultPermission(true)
        .setDescription("List's of all the ticket's that is opened."),
    category: "Ticket",
    usage: "/ticket-list",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { guild } = interaction;
        if (!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${interaction.user}, You need to have the permissions \`MANAGE_GUILD\` to execute this command!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const ticketList = async () => {
            const ticket = await TicketDB.find({});

            return (ticket.length >= 1) ? ticket : "No ticket's found";
        }

        const noTicketsFound = new MessageEmbed()
            .setDescription(`${interaction.user}, No ticket's has been found in this server!`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        const listOfTickets = await ticketList()

        if (listOfTickets === "No ticket's found") return interaction.followUp({ embeds: [noTicketsFound] })

        const increment = (function (n) {
            return function () {
                n += 1;
                return n;
            }
        }(0));

        const stringList = (await listOfTickets).map((object) => `${increment()}. **${interaction.guild.members.cache.get(object.User).user.tag}** Ticket`).join('\n').toString();

        const stringEmbed = new MessageEmbed()
            .setTitle("Ticket List")
            .setDescription(stringList)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(interaction.guild.name, interaction.guild.iconURL())

        interaction.followUp({ embeds: [stringEmbed] })
    }
}