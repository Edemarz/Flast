//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const ValidateSeconds = require("../../Functions/ValidateSeconds");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Snipe some messages 😉")
    .setDefaultPermission(true)
    .addNumberOption((option) => option.setName("amount").setDescription("The amount of messages to snipe!")
    .addChoice("1", 1)
    .addChoice("2", 2)
    .addChoice("3", 3)
    .addChoice("4", 4)
    .addChoice("5", 5)
    .addChoice("6", 6)
    .addChoice("7", 7).setRequired(true)),
    category: "Fun",
    usage: "/snipe <Amount (Number)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring
        const { options, member, user, guild } = interaction;
        //Checking Sniped Messages
        const snipedAmount = options.getNumber("amount");

        if (client.deletedMessages.length < 1 || client.deletedMessages.length?.toString() == "0") return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, There is currently no messages to snipe!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        if (snipedAmount > client.deletedMessages.length) return interaction.followUp({ embeds: [
            new MessageEmbed()
            .setAuthor(`${guild.name} Server | Snipe`, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, The amount of messages you want to snipe is ${snipedAmount} and there is only ${client.deletedMessages.length} amount of messages available to snipe!`)
            .setColor("BLURPLE")
        ] });

        const msg = await interaction.followUp({ content: `${user}, Please wait...` });

        let index = 0;
        const snipedMessages = [];

        for (const messageObject of client.deletedMessages) {
            if (index === snipedAmount) break;
            if (index < snipedAmount) snipedMessages.push(messageObject);
            index++
        };

        const increment = (function (n) {
            return function () {
                n += 1;
                return n;
            }
        }(0));

        const snipedMessagesEmbed = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Snipe`, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setDescription((snipedMessages).map((msgObject) => `${increment()}. ${msgObject.author.tag} => ${msgObject.content}\nCreated At: ${new Date(msgObject.createdAt).toLocaleDateString()} | Deleted At: ${ValidateSeconds(Date.now(), msgObject.deletedAt)}`).join('\n').toString())
        .setTimestamp()

        msg.edit({ embeds: [snipedMessagesEmbed] });
    }
}