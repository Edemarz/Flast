//Importing & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("coin-flip")
    .setDefaultPermission(true)
    .setDescription("Flip a coin and get either head or tails!"),
    category: "Fun",
    perm: "Send Messages",
    usage: "/coin-flip",
    execute(client, interaction, Discord) {
        const { guild } = interaction;
        const resp = ["Head", "Tail"];

        const respEmbed = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Coin Flip`, guild.iconURL({ dynamic: true }))
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setTimestamp()
        .setDescription(`${interaction.user}, You got a ${resp[Math.floor(Math.random() * resp.length)]}!`)

        return interaction.followUp({ embeds: [respEmbed] });
    }
}