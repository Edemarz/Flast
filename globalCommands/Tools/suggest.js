//Global Constants & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require("../../models/SuggestionSystem");
const { MessageEmbed } = require("discord.js");
const registerSuggestion = require("../../Functions/registerSuggestion");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("suggest")
    .setDefaultPermission(true)
    .setDescription("Suggest an idea of your's to the Server Suggestion Channel!")
    .addStringOption((option) => option.setName("suggestion").setDescription("The suggestion to send!").setRequired(true)),
    category: "Tools",
    usage: "/suggestion <Suggestion (Text)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { options, user, member, guild } = interaction;
        //Command System
        const CheckingDB = await DB.findOne({
            GuildID: guild.id
        });

        if (!CheckingDB) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, Please ask an admin to set up the Suggestion Channel first by doing \`\`\`/set-suggestion-channel\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        const suggestionText = options.getString("suggestion");

        const ch = guild.channels.cache.get(CheckingDB.ChannelID);

        if (!ch) return interaction.followUp({ content: "I could not find the Suggestion Channel, Please try again!" });

        const suggestionEmbed = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Suggestions`, guild.iconURL({ dynamic: true }))
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter(`Suggestion ID: N/A`, guild.iconURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setTimestamp()
        .setDescription(`Suggestion:\n\`\`\`\n${suggestionText}\n\`\`\`\nSuggestion Author: <@${user.id}> | ${user.tag}\nState: **N/A**`)

        const msg = await ch.send({ embeds: [suggestionEmbed] });

        await msg.edit({ embeds: [
            new MessageEmbed()
        .setAuthor(`${guild.name} Server | Suggestions`, guild.iconURL({ dynamic: true }))
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter(`Suggestion ID: ${msg.id}`, guild.iconURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setTimestamp()
        .setDescription(`Suggestion:\n\`\`\`\n${suggestionText}\n\`\`\`\nSuggestion Author: <@${user.id}> | ${user.tag}\nState: **N/A**`)
        ] });

        await registerSuggestion(msg, guild, user); //Register the suggestion!

        try {
            msg.react("👍")
            msg.react("👎")
        } catch (err) { console.log(err); }

        interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You're suggestion has been sent to <#${CheckingDB.ChannelID}>!`,
                color: "BLURPLE",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});
    }
}