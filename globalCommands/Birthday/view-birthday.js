//Global Constant
const { SlashCommandBuilder } = require("@discordjs/builders");
//MongoDB
const DB = require("../../models/BirthdayDB");

//Declaring the Slash Command & Calling the SlashCommandBuilder function provided by Discord
module.exports = {
    data: new SlashCommandBuilder()
        .setName("view-birthday")
        .setDefaultPermission(true)
        .setDescription("View a user's birthday, If Available.")
        .addUserOption((option) => option.setName("user").setDescription("The user to get the Birthday Information from.").setRequired(true)),
    category: "Birthday",
    usage: "/view-birthday <User (Mention)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring
        const { options, user, member, guild } = interaction;
        const { MessageEmbed } = require("discord.js");
        //Getting the Options
        const target = options.getUser("user")
        //Checking the MongoDB Database for the User
        const CheckingDB = await DB.findOne({
            GuildID: guild.id,
            User: target.id
        });
        //Viewing System
        if (!CheckingDB) return interaction.followUp({
            embeds: [
                client.createEmbed({
                    text: `${user}, The user <@${target.id}> Birthday is not saved in the Database!`,
                    color: "RED",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ]
        });

        const birthday = CheckingDB.Birthday.split('|');

        const BirthdayInformation = new MessageEmbed()
            .setAuthor(`${target.tag} Birthday | ${guild.name} Server`, target.displayAvatarURL({ dynamic: true }))
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, <@${target.id}>'s Birthday is the ${birthday[1]} (${birthday[0]?.trim()})!`)

        return interaction.followUp({ embeds: [BirthdayInformation] });
    }
}