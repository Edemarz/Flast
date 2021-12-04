//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require("../../models/EconomyDB");
const { MessageEmbed } = require("discord.js");
const ValidateSeconds = require("../../Functions/ValidateSeconds");
const v = require("../../Functions/checkDisabled");

//Export Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("beg")
    .setDefaultPermission(true)
    .setDescription("Beg for a random amount of coins!"),
    category: "Economy",
    cooldown: 300,
    usage: "/beg",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { member, user, guild } = interaction;

        const bP = await v(guild.id, "beg");

        if (bP) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The beg command & system is disabled in this server, Please ask an admin to enable the command from the [Dashboard](${client.config.Dashboard.host}/) or from the command \`\`\`/enable-economy-command <Command>\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});
        //Command System
        const amount = Math.floor(Math.random() * 5000) + 1;

        const CheckingDB = await DB.findOne({
            UserID: user.id
        });

        const UpdatedEmbed = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Beg`, guild.iconURL({ dynamic: true }))
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setTimestamp()
        .setDescription(`${user}, You have begged and got F$${amount?.toLocaleString()}, Don't beg too much because that's bad for your pride!`)

        if (CheckingDB) {
            await CheckingDB.updateOne({
                UserID: user.id,
                Wallet: CheckingDB.Wallet + amount,
                Bank: CheckingDB.Bank
            });

            return interaction.followUp({ embeds: [UpdatedEmbed] });
        };

        if (!CheckingDB) {
            await new DB({
                UserID: user.id,
                Wallet: amount,
                Bank: 0
            }).save();

            return interaction.followUp({ embeds: [UpdatedEmbed] });
        }
    }
}