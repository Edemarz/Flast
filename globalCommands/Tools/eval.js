//Importing & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const ClientData = require("../../ClientData.json");
const { inspect } = require("util");
const { MessageEmbed } = require("discord.js");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("eval")
    .setDefaultPermission(true)
    .setDescription("Evaluate a code that gets executed asynchronously!")
    .addStringOption((option) => option.setName("code").setDescription("The code to evaluate!").setRequired(true)),
    category: "Tools",
    usage: "/eval <Code (String)>",
    perm: "Flast Developer Only",
    async execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { options, user, member, guild } = interaction;
        //Checking;
        if (user.id !== ClientData.Flast.DeveloperID) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, To execute this command you need to be Edemarz#6565!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]})
        //Getting the Options
        const codeOption = options.getString("code");
        //The Evaluate System
        let evaledCode;
        try {
            evaledCode = await eval(codeOption).catch((err) => console.log(err));
        } catch (err) { console.log(err); }

        const codeOutput = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Evaluate`, guild.iconURL({ dynamic: true }))
            .setDescription(`Evaluated Code:\n\`\`\`js\n${codeOption}\n\`\`\`\nOutput:\n\`\`\`js\n${inspect(evaledCode)}\n\`\`\``)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))

        interaction.followUp({ embeds: [codeOutput] })
    }
}