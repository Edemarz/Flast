//Global Constants
const DB = require("../../models/BirthdayDB");
const { SlashCommandBuilder } = require("@discordjs/builders");
//Declaring Commands
module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDefaultPermission(true)
    .setDescription("View the bot latency, api latency and database latency!"),
    category: "Information",
    usage: "/ping",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring
        const { member, user, guild, channel } = interaction;
        const { MessageEmbed } = require("discord.js");
        //Defining
        let dbLatency;
        const wsLatency = Math.round(client.ws.ping);
        let editLatency;
        //Getting Database Latency
        const st = Date.now();
        let en;
        await DB.find().then(() => en = Date.now());

        dbLatency = en - st;
        //Getting Client Latency
        const st1 = Date.now();
        let en2;
        await interaction.followUp({ content: "Please wait..." }).then(() => en2 = Date.now());
        editLatency = en2 - st1;
        //Editing & Finishing Command
        const LatencyEmbed = new MessageEmbed()
        .setAuthor(`${client.user.username} Latency | ${guild.name} Server`, guild.iconURL({ dynamic: true }))
        .setDescription(`Client Latency: ${wsLatency}ms\nClient API Latency: ${editLatency}ms\nDatabase Latency: ${dbLatency}ms`)
        .setColor("BLURPLE")
        .setTimestamp()
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))

        try {
            channel.send({ embeds: [LatencyEmbed] });
        } catch (err) { console.log(err) };
    }
}