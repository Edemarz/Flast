const VerDB = require("../../models/VerificationSystem");
const { MessageEmbed } = require("discord.js");
const MessageDB = require("../../models/VerificationMessage");

module.exports = async (Discord, client, messageReaction, user) => {
    if (!messageReaction.message.guild || !messageReaction.message.channel || user.bot) return;

    const message = messageReaction.message;
    const { author, channel, guild } = messageReaction.message;
    
    const member = await guild.members.cache.get(user.id);

    //Verification System
    const CheckingDB = await VerDB.findOne({
        GuildID: guild.id
    });

    if (CheckingDB) {
        if (channel.id === CheckingDB.VerificationChannel) {
            const verRole = await guild.roles.cache.get(CheckingDB.VerificationRole);

            if (!verRole) return;
            const checkingMessage = await MessageDB.findOne({
                GuildID: guild.id,
                MessageID: message.id
            });

            if (!checkingMessage) return;

            if (CheckingDB.VerificationType.type === "react-based") {
                if (message.id === checkingMessage.MessageID) {
                    if (messageReaction.emoji.name == "⭐") {
                        if (member.roles.cache.has(verRole.id)) return channel.send({ content: `${user}, You already verified!`}).then((msg) => setTimeout(() => msg.delete(), 5000)), messageReaction.remove().then(message.react("⭐"))
                        if (!member.roles.cache.has(verRole.id)) member.roles.add(verRole);
                        
                    const youHaveVerified = new MessageEmbed()
                        .setAuthor(`${guild.name} Server | Verification`, guild.iconURL({ dynamic: true }))
                        .setThumbnail(guild.iconURL({ dynamic: true }))
                        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                        .setColor("BLURPLE")
                        .setTimestamp()
                        .setDescription(`${user}, You have successfuly been verified in ${guild.name}, Have Fun!`)

                        user.send({ embeds: [youHaveVerified] }).catch((err) => null);
                        message.channel.send({ content: `${user}, You have successfully verified!` }).then((msg) => setTimeout(() => msg.delete(), 5000));
                        messageReaction.remove().then(message.react("⭐"))
                        return
                    }
                }
            }
        }
    }
}