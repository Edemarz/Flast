//Imports
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");
const DB = require("../../models/SuggestionSystem");
const ValidatePermission = require("../../Functions/ValidatePermission");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("set-suggestion-channel")
    .setDefaultPermission(true)
    .setDescription("Set the Suggestion Channel for the Server!")
    .addChannelOption((option) => option.setName("suggestion-channel").setDescription("The suggestion channel!")),
    category: "Settings",
    usage: "/set-suggestion-channel <Channel (Mention)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { options, user, member, guild, channel } = interaction;

        await ValidatePermission({
            member: member,
            interaction: interaction,
            Flag: Permissions.FLAGS.MANAGE_GUILD,
            user: user,
            flagName: "MANAGE_GUILD"
        });

        const ChannelOption = options.getChannel("suggestion-channel");

        const CheckingDB = await DB.findOne({
            GuildID: guild.id
        });

        const updatedEmbed = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Suggestion System`, guild.iconURL({ dynamic: true }))
        .setDescription(`${user}, You have setted/updated the Suggestion Channel to <#${ChannelOption.id}>!`)
        .setColor("BLURPLE")
        .setTimestamp()
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))

        if (CheckingDB) {
            await CheckingDB.updateOne({
                GuildID: guild.id,
                ChannelID: ChannelOption.id
            });

            return interaction.followUp({ embeds: [updatedEmbed] });
        };

        if (!CheckingDB) {
            await new DB({
                GuildID: guild.id,
                ChannelID: ChannelOption.id
            }).save();

            return interaction.followUp({ embeds: [updatedEmbed] });
        };
    }
}