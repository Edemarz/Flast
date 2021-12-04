//Defining Packages & Destructuring
const { MessageEmbed, Permissions, MessageAttachment } = require("discord.js");
const DB = require("../../models/WelcomeDB");
const Canvacord = require("canvacord");

//Exporting the Event
module.exports = async (Discord, client, member) => {
    const CheckingDB = await DB.findOne({
        GuildID: member.guild.id
    });

    if (CheckingDB) {
        const ch = await member.guild.channels.cache.get(CheckingDB.ChannelID);
        const rl = await member.guild.roles.cache.get(CheckingDB.RoleID);

        if (!ch || !rl) return;

        const WelcomeImage = new Canvacord.Welcomer()
            .setUsername(member.user.username)
            .setDiscriminator(member.user.discriminator)
            .setAvatar(member.user.displayAvatarURL({ format: "png" }))
            .setColor("title", "#34ebe5")
            .setColor('username-box', "#34eb71")
            .setColor("discriminator-box", "#ebd934")
            .setColor("message-box", "#344feb")
            .setColor("border", "#eb7a34")
            .setColor("avatar", "#0da4db")
            .setBackground("https://i.pinimg.com/originals/fd/91/13/fd91131ea693096d6be5e8aa99d18f9e.jpg")
            .setMemberCount(member.guild.memberCount) // We are adding 1 member since the user joined the guild but the member count have not updated!
            .setGuildName(member.guild.name)

        const joinedHeppy = new MessageEmbed()
        .setAuthor(`${member.guild.name} Server | Welcome`, member.guild.iconURL({ dynamic: true }))
        .setDescription(`<@${member.user.id}> (${member.user.tag}), has joined the server.\nHope you have a good time, Have Fun!`)
        .setColor("BLURPLE")
        .setTimestamp()
        .setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }))
        .setThumbnail(member.guild.iconURL({ dynamic: true }))

        ch.send({ embeds: [joinedHeppy], files: [await WelcomeImage.build()] }).catch((err) => null);

        member.roles.add(rl).catch((err) => null);
    }
}