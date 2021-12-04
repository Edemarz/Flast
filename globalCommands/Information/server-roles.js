//Importing & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("server-roles")
    .setDefaultPermission(true)
    .setDescription("List all the server roles!"),
    category: "Information",
    usage: "/server-roles",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { user, member, guild } = interaction;
        //Command System
        const serverRoles = new MessageEmbed()
        .setDescription(`Roles Count: ${guild.roles.cache.size - 1} Roles\n\n${guild.roles.cache.filter((rl) => rl.id !== guild.id).sort((a, b) => b.rawPosition - a.rawPosition).map((rl) => `- <@&${rl.id}>`).join('\n')?.toString()}`)
        .setColor("BLURPLE")
        .setTimestamp()
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setAuthor(`${guild.name} Server | Roles`)

        return interaction.followUp({ embeds: [serverRoles] });
    }
}