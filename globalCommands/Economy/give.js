//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const EcoDB = require("../../models/EconomyDB");
const { MessageEmbed } = require("discord.js");

//Exporting Data
module.exports = {
    data: new SlashCommandBuilder()
        .setName("give")
        .setDescription("Give a user a specific amount of Flast Cash from your wallet!")
        .setDefaultPermission(true)
        .addUserOption((opt) => opt.setName("target").setDescription("The user to send the flast cash to").setRequired(true))
        .addNumberOption((opt) => opt.setName("amount").setDescription("The amount of Flast Cash to give.").setRequired(true)),
    category: "Economy",
    usage: "/give <User> <Amount (Integer)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Command System
        const { user, member, guild, options } = interaction;

        const target = options.getUser("target");
        const amount = options.getNumber("amount");

        if (amount < 1) return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Give`, guild.iconURL({ dynamic: true }))
                    .setDescription(`${user}, You cannot give lower than F$1 to a user!`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            ]
        });

        if (Number.isInteger(amount) === false) return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Give`, guild.iconURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                    .setColor("RED")
                    .setDescription(`${user}, The amount must be an integer!`)
            ]
        });

        const UserDB = await EcoDB.findOne({
            UserID: user.id
        });

        if (!UserDB) {
            await new UserDB({
                UserID: user.id,
                Wallet: 0,
                Bank: 0
            }).save();

            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`${guild.name} Server | Give`, guild.iconURL({ dynamic: true }))
                        .setTimestamp()
                        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                        .setColor("RED")
                        .setDescription(`${user}, You have no Flast Cash in your wallet to give, get more money first then give it to someone :wink:.`)
                ]
            });
        };

        if (amount > UserDB.Wallet) return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Give`, guild.iconURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                    .setColor("RED")
                    .setDescription(`${user}, You do not have F$${amount?.toLocaleString()} in your wallet!`)
            ]
        });

        const TarDB = await EcoDB.findOne({
            UserID: target.id
        });

        if (TarDB) {
            await UserDB.updateOne({
                UserID: user.id,
                Wallet: UserDB.Wallet - amount,
                Bank: UserDB.Bank
            });

            await TarDB.updateOne({
                UserID: target.id,
                Wallet: TarDB.Wallet + amount,
                Bank: TarDB.Bank
            });

            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`${guild.name} Server | Give`, guild.iconURL({ dynamic: true }))
                        .setTimestamp()
                        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                        .setColor("BLURPLE")
                        .setDescription(`${user}, You have given <@${target.id}> F$${amount} of cash!`)
                ]
            });
        }

        if (!TarDB) {
            await UserDB.updateOne({
                UserID: user.id,
                Wallet: UserDB.Wallet - amount,
                Bank: UserDB.Bank
            });

            await new EcoDB({
                UserID: target.id,
                Wallet: amount,
                Bank: 0
            }).save();

            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`${guild.name} Server | Give`, guild.iconURL({ dynamic: true }))
                        .setTimestamp()
                        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                        .setColor("BLURPLE")
                        .setDescription(`${user}, You have given <@${target.id}> F$${amount} of cash!`)
                ]
            });
        };
    }
}