//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const EcoDB = require("../../models/EconomyDB");
const { MessageEmbed } = require("discord.js");
const EcoSettings = require("../../models/EcoSettings");
const ActiveEffects = require("../../models/ActiveEffects");
const Functions = require("../../GlobalFunctions");

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

        const TargetActiveEffects = await ActiveEffects.findOne({
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

        let included;

        if (TargetActiveEffects) {

            for (const effect of TargetActiveEffects.Effects) {
                if (effect.name?.toLowerCase() == "padlock") included = true;
            };
        };

        if (included || included === true ) {
        const msg = await interaction.channel.send({ content: `Opening ${tar.username}'s Padlock.` });

        await Functions.Sleep(1.5);
        msg.edit({ content: `Opening ${tar.username}'s Padlock..` });
        await Functions.Sleep(1.5);
        msg.edit({ content: `Opening ${tar.username}'s Padlock...` });
        await Functions.Sleep(1.5);
        msg.edit({ content: `Opening ${tar.username}'s Padlock.` });
        await Functions.Sleep(1.5);
        msg.edit({ content: `Opening ${tar.username}'s Padlock..` });
        await Functions.Sleep(1.5);
        msg.edit({ content: `Opening ${tar.username}'s Padlock...` });
        await Functions.Sleep(1.5);
            const robbedBruh1 = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Rob`)
        .setDescription(`${user}, You took too long opening ${tar.username}'s padlock and you were caught and paid F$5,000. Don't rob kiddo.`)
        .setColor("RED")
        .setTimestamp()
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))

        const robbedBruh2 = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Rob`)
        .setDescription(`${user}, You took too long opening ${tar.username}'s padlock and you were caught but since you had no money, you didn't lose anything.`)
        .setColor("RED")
        .setTimestamp()
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))

            if (exeDB) {
                await exeDB.updateOne({
                    UserID: user.id,
                    Wallet: exeDB.Wallet - 5000,
                    Bank: exeDB.Bank
                });
    
                await tarDB.updateOne({
                    UserID: tar.id,
                    Wallet: tarDB.Wallet + 5000,
                    Bank: tarDB.Bank
                });
    
                return interaction.followUp({ embeds: [robbedBruh1] });
            };
    
            if (!exeDB) {
                await new EcoDB({
                    UserID: user.id,
                    Wallet: 0,
                    Bank: 0
                }).save();
    
                return interaction.followUp({ embeds: [robbedBruh2] });
            };
        }

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