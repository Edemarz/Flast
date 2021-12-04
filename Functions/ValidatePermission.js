const { MessageEmbed } = require("discord.js");

function ValidatePermission(option = {}) {
    if (!option.member.permissions.has(option.Flag)) return option.interaction.followUp({ embeds: [
        new MessageEmbed()
        .setAuthor(`${option.interaction.guild.name} Server | Permission`, option.interaction.guild.iconURL({ dynamic: true }))
        .setColor("RED")
        .setTimestamp()
        .setDescription(`${option.user}, You need the permissions \`${option.flagName}\` to execute this command!`)
        .setFooter(option.interaction.guild.name, option.interaction.guild.iconURL({ dynamic: true }))
        .setThumbnail(option.interaction.guild.iconURL({ dynamic: true }))
    ] });
}

module.exports = ValidatePermission;