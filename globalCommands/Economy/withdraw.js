//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const DB = require("../../models/EconomyDB");
const v = require("../../Functions/checkDisabled");

//Export Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDefaultPermission(true)
    .setDescription(`Withdraw an amount of Flast Cash from your Bank!`)
    .addNumberOption((option) => option.setName("amount").setDescription("The amount to withdraw!").setRequired(true)),
    category: "Economy",
    usage: "/deposit <Amount (Number)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { member, options, user, guild } = interaction;

        const bP = await v(guild.id, "withdraw");

        if (bP) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The withdraw command & system is disabled in this server, Please ask an admin to enable the command from the [Dashboard](${client.config.Dashboard.host}/) or from the command \`\`\`/enable-economy-command <Command>\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]})

        const withAmount = options.getNumber("amount");
        //Command System
        const CheckingDB = await DB.findOne({
            UserID: user.id
        });

        if (withAmount < 1) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The withdraw amount must not be lower than 1!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        if (CheckingDB) {
            if (Number.isInteger(withAmount) === false) return interaction.followUp({ embeds: [
                client.createEmbed({
                    text: `${user}, You cannot enter decimals amount!`,
                    color: "RED",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ]});

            if (withAmount > CheckingDB.Bank) return interaction.followUp({ embeds: [
                client.createEmbed({
                    text: `${user}, You do not have F$${withAmount?.toLocaleString()} in your Bank!`,
                    color: "RED",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ]});

            await CheckingDB.updateOne({
                UserID: user.id,
                Wallet: CheckingDB.Wallet + withAmount,
                Bank: CheckingDB.Bank - withAmount
            });

            const withXD = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Withdraw`, guild.iconURL({ dynamic: true }))
            .setColor("BLURPLE")
            .setTimestamp()
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You have withdrawed F$${withAmount?.toLocaleString()} from your bank!`)

            return interaction.followUp({ embeds: [withXD] });
        };

        if (!CheckingDB) {
            await new DB({
                UserID: user.id,
                Wallet: 0,
                Bank: 0
            }).save()

            const noAmount = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Withdraw`, guild.iconURL({ dynamic: true }))
            .setColor("RED")
            .setTimestamp()
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You do not have F$${withAmount} in your wallet!`)

            return interaction.followUp({ embeds: [noAmount] });
        }
    }
}