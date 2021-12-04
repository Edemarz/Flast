//Importing & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require("../../models/EconomyDB");
const Functions = require("../../GlobalFunctions");
const { MessageEmbed } = require("discord.js");

//Exporting the Command!
module.exports = {
    data: new SlashCommandBuilder() //Build the Slash Command
    .setName("leaderboard")
    .setDefaultPermission(true)
    .setDescription("The Global Economy Leaderboard!"),
    category: "Economy",
    usage: "/leaderboard",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        // Destructure Interaction & Check if the Command is Disabled!
        const { options, member, guild, user } = interaction;

        const isDisabled = await Functions.checkEcoDisabled(guild.id, "leaderboard");

        //If it is Disabled, send a message

        if (isDisabled) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The leaderboard command & system is disabled in this server, Please ask an admin to enable it either on the [Dashboard](${client.config.Dashboard.host}/) or by doing \`\`\`\n/enable-economy-command <Command>\n\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        //Get all the documents in the Economy Database!

        const allData = await Functions.findAll_Type_Collection(DB, 10);

        //It's impossible to have 0 users in the database, so no checking needed.

        const increment = (function (n) {
            return function () {
                n += 1;
                return n;
            }
        }(0));

        const returningEmbed = new MessageEmbed()
        .setAuthor(`${guild.name} | Global Economy Leaderboard`)
        .setDescription((allData).map((eco) => `${increment()}. ${client.users.cache.get(eco.UserID) ? client.users.cache.get(eco.UserID).tag : "Unknown"}\n\`\`\`js\nWallet: F$${eco.Wallet?.toLocaleString()}\nBank: F$${eco.Bank?.toLocaleString()}\n\`\`\``).join("\n").toString())
        .setColor("AQUA")
        .setTimestamp()
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))

        return interaction.followUp({ embeds: [returningEmbed] });
    }
}