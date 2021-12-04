//Importing Database & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require('../../models/SuggestionDB');
const SystemDB = require("../../models/SuggestionSystem");
const { Permissions, MessageEmbed, ApplicationCommandPermissionsManager } = require("discord.js");
const ValidatePermission = require("../../Functions/ValidatePermission");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("deny-suggestion")
    .setDefaultPermission(true)
    .setDescription("Deny a member's suggestion!")
    .addStringOption((option) => option.setName("suggestion-id").setDescription("The Suggestion ID, Located at the footer of the suggestion!").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("The reason to deny this suggestion!").setRequired(true)),
    category: "Moderator-tools",
    usage: "/accept-suggestion <Suggestion ID (Text / String)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        //Destructuring
        const { options, user, member, guild } = interaction;
        //Validating User Permission
        await ValidatePermission({
            Flag: Permissions.FLAGS.MANAGE_GUILD,
            flagName: "MANAGE_GUILD",
            member: member,
            user: user,
            interaction: interaction
        });
        //Checking the Suggestion Channel Database
        const CheckingSystemDB = await SystemDB.findOne({
            GuildID: guild.id
        });

        if (!CheckingSystemDB) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, Please ask an admin to set up the Suggestion Channel by doing:\`\`\`\n/set-suggestion-channel\n\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });
        //Starting Command
        const SuggestionID = options.getString("suggestion-id");
        const Reason = options.getString("reason");

        const SystemChannel = guild.channels.cache.get(CheckingSystemDB.ChannelID);

        const findingMessageDB = await DB.findOne({
            GuildID: guild.id,
            MessageID: SuggestionID
        });

        if (!findingMessageDB) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You cannot deny the suggestion because someone has denied or accepted his/her suggestion!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] })


        const SuggestionMessage = await SystemChannel.messages.fetch(SuggestionID);

        if (!SuggestionID) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, I cannot find any Suggestion with the ID:\`\`\`\n${SuggestionID}\n\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const embedData = SuggestionMessage.embeds[0];

        const replacedData = `${embedData.description}`.replace("**N/A**", "**Denied**");

        const acceptedEmbed = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Suggestions`, guild.iconURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setTimestamp(embedData.timestamp)
        .setThumbnail(embedData.thumbnail.url)
        .setFooter(embedData.footer.text, embedData.footer.iconURL)
        .setDescription(`${replacedData}\nReason: \`\`\`\n${Reason}\n\`\`\``)

        SuggestionMessage.edit({ embeds: [acceptedEmbed] });

        const author = guild.members.cache.get(findingMessageDB.Author);

        findingMessageDB.deleteOne();

        const acceptedSuggestion = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Denied Suggestion`, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setDescription(`${user}, You have Denied ${author ? author : "Internal Error"}'s Suggestion!`)
        .setColor("BLURPLE")
        .setTimestamp()

        interaction.followUp({ embeds: [acceptedSuggestion] });
    }
}