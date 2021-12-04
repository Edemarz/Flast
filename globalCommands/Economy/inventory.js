//Importing & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const InvDB = require("../../models/Inventory");
const { MessageEmbed } = require("discord.js");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("inventory")
    .setDefaultPermission(true)
    .setDescription("View your inventory or another user's inventory!")
    .addUserOption((option) => option.setName("user").setDescription("The user to view the inventory of! [Optional]")),
    category: "Economy",
    usage: "/inventory <User (Mention) [OPTIONAL]>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { member, user, guild, options } = interaction;

        //Command System
        const userOpt = options.getUser("user");
        
        if (userOpt) {
            const SearchInv = await InvDB.findOne({
                UserID: userOpt.id
            });

            if (!SearchInv) return interaction.followUp({ embeds: [
                new MessageEmbed()
                .setAuthor(`${guild.name} Server | Inventory`)
                .setDescription(`${user}, The user <@${userOpt.id}> does not have any items in his/her inventory!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            ]});

            let laptopAmount = 0;

            let textData;

            for (const item of SearchInv.Inventory) {
                if (item.item?.toLowerCase() == "laptop") laptopAmount++;
            }

            if (laptopAmount?.toString() != "0") textData = `💻 **Laptop** ─ ${laptopAmount}`;

            const UserInv = new MessageEmbed()
            .setAuthor(`${userOpt.tag} Inventory | ${guild.name} Server`, userOpt.displayAvatarURL({ dynamic: true }))
            .setDescription(`**Owned Items**\n${textData ? textData : "Internal Error"} `)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))

            return interaction.followUp({ embeds: [UserInv] });
        };

        if (!userOpt) {
            const SearchInv = await InvDB.findOne({
                UserID: user.id
            });

            if (!SearchInv) return interaction.followUp({ embeds: [
                new MessageEmbed()
                .setAuthor(`${guild.name} Server | Inventory`)
                .setDescription(`${user}, You do not have any items in your inventory!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            ]});

            let laptopAmount = 0;

            let textData;

            for (const item of SearchInv.Inventory) {
                if (item.item?.toLowerCase() == "laptop") laptopAmount++;
            }

            if (laptopAmount?.toString() != "0") textData = `💻 **Laptop** ─ ${laptopAmount}`;

            const UserInv = new MessageEmbed()
            .setAuthor(`${user.tag} Inventory | ${guild.name} Server`, user.displayAvatarURL({ dynamic: true }))
            .setDescription(`**Owned Items**\n${textData ? textData : "Internal Error"} `)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))

            return interaction.followUp({ embeds: [UserInv] });
        }
    }
}