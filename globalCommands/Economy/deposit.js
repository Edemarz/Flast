//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const DB = require("../../models/EconomyDB");
const checkDisabled = require("../../Functions/checkDisabled");

//Export Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("deposit")
    .setDefaultPermission(true)
    .setDescription(`Deposit an amount of Flast Cash to your Bank!`)
    .addNumberOption((option) => option.setName("amount").setDescription("The amount to deposit!").setRequired(true)),
    category: "Economy",
    usage: "/deposit <Amount (Number)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { member, options, user, guild } = interaction;

        const disabled = await checkDisabled(guild.id, "deposit");

        if (disabled) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The deposit command & system is disabled in this server, Please ask an admin to enable the command from the [Dashboard](${client.config.Dashboard.host}/) or from the command \`\`\`/enable-economy-command <Command>\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        const depAmount = options.getNumber("amount");
        //Command System
        const CheckingDB = await DB.findOne({
            UserID: user.id
        });

        if (depAmount < 1) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The deposit amount must not be lower than 1!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        if (CheckingDB) {
            if (Number.isInteger(depAmount) === false) return interaction.followUp({ embeds: [
                client.createEmbed({
                    text: `${user}, You cannot enter decimals amount!`,
                    color: "RED",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ]});

            if (depAmount > CheckingDB.Wallet) return interaction.followUp({ embeds: [
                client.createEmbed({
                    text: `${user}, You do not have F$${depAmount?.toLocaleString()} in your wallet!`,
                    color: "RED",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ]});

            await CheckingDB.updateOne({
                UserID: user.id,
                Wallet: CheckingDB.Wallet - depAmount,
                Bank: CheckingDB.Bank + depAmount
            });

            const deppedXD = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Deposit`, guild.iconURL({ dynamic: true }))
            .setColor("BLURPLE")
            .setTimestamp()
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You have deposited F$${depAmount?.toLocaleString()} to your bank!`)

            return interaction.followUp({ embeds: [deppedXD] });
        };

        if (!CheckingDB) {
            await new DB({
                UserID: user.id,
                Wallet: 0,
                Bank: 0
            }).save()

            const noAmount = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Deposit`, guild.iconURL({ dynamic: true }))
            .setColor("RED")
            .setTimestamp()
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You do not have F$${depAmount} in your wallet!`)

            return interaction.followUp({ embeds: [noAmount] });
        }
    }
}