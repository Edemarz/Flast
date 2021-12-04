//Imporing & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");

//Export Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("meme")
    .setDefaultPermission(true)
    .setDescription("Get a random meme from 9Gag!"),
    category: "Fun",
    usage: "/meme",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
    const { user, member, guild } = interaction;
    const randomMeme = await require("random-memes").random();

    const Embed = new Discord.MessageEmbed()
      .setColor("BLURPLE")
      .setDescription(`Category: ${client.capitalizeFirst(randomMeme.category)}\nCaption: ${randomMeme.caption}`)
      .setImage(randomMeme.image)
      .setTimestamp()
      .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))

      return interaction.followUp({ embeds: [Embed] });
    }
}