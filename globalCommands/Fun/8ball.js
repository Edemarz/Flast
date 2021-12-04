const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("8ball")
    .setDefaultPermission(true)
    .setDescription("An 8 ball command!")
    .addStringOption((option) => option.setName("question").setDescription("The question to ask!").setRequired(true)),
    category: "Fun",
    usage: "/8ball <Question>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const responses = [
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes definitely.",
            "You may rely on it.",    
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes.",
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
            "Don't count on it.",
            "My reply is no.",
            "My sources say no",
            "Outlook not so good.",
            "Very doubtful"
        ];
        const { user, guild, options } = interaction;
        const randomAnswer = Math.floor(Math.random() * responses.length);

        const q = options.getString("question");

        const Result = new MessageEmbed()
        .setTimestamp()
        .setAuthor(`${guild.name} | 8Ball`, guild.iconURL({ dynamic: true }))
        .setDescription(`Question: ${client.capitalizeFirst(q)}\nAnswer: ${responses[randomAnswer]}`)
        .setColor("BLURPLE")
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))

        interaction.followUp({ embeds: [Result] });
    }
}