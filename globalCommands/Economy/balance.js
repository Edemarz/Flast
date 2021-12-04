//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const DB = require("../../models/EconomyDB");
const v = require("../../Functions/checkDisabled");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("balance")
    .setDefaultPermission(true)
    .setDescription("View your Balance or a user's Balance in the Economy System!")
    .addUserOption((option) => option.setName("user").setDescription("The user to view the balance of. [OPTIONAL]")),
    category: "Economy",
    usage: "/balance <User (Optional)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { user, member, guild, options } = interaction;

        const bP = await v(guild.id, "balance");

        if (bP) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The balance command & system is disabled in this server, Please ask an admin to enable the command from the [Dashboard](${client.config.Dashboard.host}/) or from the command \`\`\`/enable-economy-command <Command>\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]})

        let userOpt = options.getUser("user");
        //Command System
        const CheckingDB = await DB.findOne({
            UserID: userOpt ? userOpt.id : user.id
        });

        if (CheckingDB) {
            const EconomyEmbed = new MessageEmbed()
            .setAuthor(`${userOpt ? userOpt.tag : user.tag} Balance | ${guild.name} Server`, userOpt ? userOpt.displayAvatarURL({ dynamic: true }) : user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: `${userOpt ? userOpt.username : user.username}'s Wallet`,
                    value: `${userOpt ? "He" : "You"} ${userOpt ? "has" : "have"} F$${CheckingDB.Wallet?.toLocaleString()} in ${userOpt ? "his" : "your"} wallet.`
                },
                {
                    name: `${userOpt ? userOpt.username : user.username}'s Bank`,
                    value: `${userOpt ? "He" : "You"} ${userOpt ? "has" : "have"} F$${CheckingDB.Bank?.toLocaleString()} in ${userOpt ? "his" : "your"} bank.`
                }
            )
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(`${userOpt ? userOpt.username : user.username}'s Balance`)
            .setThumbnail(userOpt ? userOpt.displayAvatarURL({ dynamic: true }) : user.displayAvatarURL({ dynamic: true }))

            return interaction.followUp({ embeds: [EconomyEmbed] });
        };

        if (!CheckingDB) {
            await new DB({
                UserID: userOpt ? userOpt.id : user.id,
                Wallet: 0,
                Bank: 0
            }).save();

            const EconomyEmbed = new MessageEmbed()
            .setAuthor(`${userOpt ? userOpt.tag : user.tag} Balance | ${guild.name} Server`, userOpt ? userOpt.displayAvatarURL({ dynamic: true }) : user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: `${userOpt ? userOpt.username : user.username}'s Wallet`,
                    value: `${userOpt ? "He" : "You"} ${userOpt ? "has" : "have"} F$${CheckingDB.Wallet?.toLocaleString()} in ${userOpt ? "his" : "your"} wallet.`
                },
                {
                    name: `${userOpt ? userOpt.username : user.username}'s Bank`,
                    value: `${userOpt ? "He" : "You"} ${userOpt ? "has" : "have"} F$${CheckingDB.Bank?.toLocaleString()} in ${userOpt ? "his" : "your"} bank.`
                }
            )
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(`${userOpt ? userOpt.username : user.username}'s Balance`)
            .setThumbnail(userOpt ? userOpt.displayAvatarURL({ dynamic: true }) : user.displayAvatarURL({ dynamic: true }))

            return interaction.followUp({ embeds: [EconomyEmbed] });
        }
    }
}