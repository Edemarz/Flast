//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const EcoDB = require("../../models/EconomyDB");
const { MessageEmbed } = require("discord.js");
const EcoSettings = require("../../models/EcoSettings");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("rob")
    .setDefaultPermission(true)
    .setDescription("Rob a user out of their Flast Cash in their wallet!")
    .addUserOption((option) => option.setName("user").setDescription("The user to rob!").setRequired(true)),
    category: "Economy",
    cooldown: 600,
    usage: "/rob <User (Mention)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { guild, member, user, options } = interaction;
        //Command Start
        const Settings = await EcoSettings.findOne({
            GuildID: guild.id
        });

        if (Settings && Settings.Disabled && Settings.Disabled.Commands.includes("rob")) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The rob command & system is disabled in this server, Please ask an admin to enable the command from the [Dashboard](${client.config.Dashboard.host}/) or from the command \`\`\`/enable-economy-command <Command>\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const tar = options.getUser("user");

        if (tar.id === user.id) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, Why are you trying to rob yourself?`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });
        
        const tarDB = await EcoDB.findOne({
            UserID: tar.id
        });

        if (!tarDB || tarDB.Wallet < 1 || tarDB.Wallet === 1 || tarDB.Wallet?.toString() == "1") return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, Who you are trying to rob has no money, Find someone else to rob, You criminal!`,
                color: "AQUA",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const rM = tarDB.Wallet - 1;

        const randAmount = Math.floor(Math.random() * rM) + 1;

        const exeDB = await EcoDB.findOne({
            UserID: user.id
        });

        const robbedBruh = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Rob`)
        .setDescription(`${user}, You have just commited a crime by robbing <@${tar.id}> out of F$${randAmount?.toLocaleString()}!`)
        .setColor("BLURPLE")
        .setTimestamp()
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))

        if (exeDB) {
            await exeDB.updateOne({
                UserID: user.id,
                Wallet: exeDB.Wallet + randAmount,
                Bank: exeDB.Bank
            });

            await tarDB.updateOne({
                UserID: tar.id,
                Wallet: tarDB.Wallet - randAmount,
                Bank: tarDB.Bank
            });

            return interaction.followUp({ embeds: [robbedBruh] });
        };

        if (!exeDB) {
            await new EcoDB({
                UserID: user.id,
                Wallet: randAmount,
                Bank: 0
            }).save();

            await tarDB.updateOne({
                UserID: tar.id,
                Wallet: tarDB.Wallet - randAmount,
                Bank: tarDB.Bank
            });

            return interaction.followUp({ embeds: [robbedBruh] });
        };
    }
}