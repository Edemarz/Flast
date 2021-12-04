const { MessageEmbed } = require("discord.js");
const afkDB = require("../../models/afkDB");
const VerificationDB = require("../../models/VerificationSystem");
const TicketDB = require("../../models/TicketDB");
const TicketSystem = require("../../models/TicketSystemDB");
const MessageDB = require("../../models/TicketMessageDB");
const ExtraUser = require("../../models/extraTicketUser");
const TicketMemberDeletionDB = require("../../models/TicketMemberDeletion");

module.exports = async (Discord, client, message) => {
    if (!message.guild || !message.channel || message.author.bot) return
    
    const { guild, channel, author } = message;

    const VerificationCheck = await VerificationDB.findOne({
        GuildID: guild.id
    });

    if (VerificationCheck) {
        if (message.channel.id === VerificationCheck.VerificationChannel) {
            const verRole = await message.guild.roles.cache.get(VerificationCheck.VerificationRole);

            if (!verRole) return;

            if (VerificationCheck.VerificationType.type === "text-based") {
                if (message.content == `I agree to be a member of ${message.guild.name}`) {
                    if (message.member.roles.cache.has(verRole.id)) return message.channel.send({ content: `${author}, You already verified!` }).then((msg) => setTimeout(() => msg.delete(), 5000)), message.delete();
                    if (!message.member.roles.cache.has(verRole.id)) message.member.roles.add(verRole);
                    const youHaveVerified = new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Verification`, guild.iconURL({ dynamic: true }))
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                    .setColor("BLURPLE")
                    .setTimestamp()
                    .setDescription(`${author}, You have successfuly been verified in ${guild.name}, Have Fun!`)

                    message.author.send({ embeds: [youHaveVerified] }).catch((err) => console.log("Unable to send a DM!"));
                    message.channel.send({ content: `${author}, You have verified.` }).then((msg) => setTimeout(() => msg.delete(), 5000));
                    message.delete()
                    return
                } else message.delete()
            }
        }
    }

    if (message.mentions.members.first()) {
        const afkCheck = await afkDB.findOne({
            GuildID: message.guild.id,
            UserID: message.mentions.members.first().user.id
        });

        if (afkCheck) {
            const heIsAFK = client.createEmbed({
                text: `${message.author}, ${message.mentions.members.first().user.tag} is AFK - ${afkCheck.Reason}`,
                color: "BLURPLE",
                footerOne: message.author.tag,
                footerTwo: message.author.displayAvatarURL({ dynamic: true }),
                thumbnail: message.guild.iconURL({ dynamic: true })
            });

            message.channel.send({ embeds: [heIsAFK] }).then((msg) => {
                setTimeout(() => {
                    try {
                        msg.delete()
                    } catch (err) { console.log(client.colorText(err)) };
                }, 5000);
            });
        }
    };

    //Afk Check

    const afkCheck = await afkDB.findOne({
        GuildID: message.guild.id,
        UserID: message.author.id
    });

    if (afkCheck) {
        let afkAt = Date.now() - afkCheck.AfkAt;
        const hourCheck = afkAt / 60 / 60 / 60 >= 1;
        const minuteCheck = afkAt / 60 / 60 >= 1;
        let remainingMinutes;
        let remainingSeconds;
        let divider;

        let backupAfk = afkAt;

        if (afkAt / 1000 / 60 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60 / 60) === true) afkAt = `${Math.round(afkAt / 1000 / 60 / 60)} hour(s) ago.`;
        if (afkAt / 1000 / 60 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60 / 60) === false) {
            remainingMinutes = `${afkAt / 1000 / 60 / 60}`.split('.')[1];
            if (!Number(remainingMinutes) / 1000 / 60 >= 1) afkAt = `${Math.round(afkAt / 1000 / 60 / 60)} hour(s) ago.`;
            if (Number(remainingMinutes) / 1000 / 60 >= 1) afkAt = `${Math.round(afkAt / 1000 / 60 / 60)} hour(s) and ${Math.round(Number(remainingMinutes) / 1000 / 60)} minute(s) ago.`;
        };
        if (afkAt / 1000 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60) === true) afkAt = `${Math.round(afkAt / 1000 / 60)} minute(s) ago.`;
        if (afkAt / 1000 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60) === false) {
            remainingSeconds = `${afkAt / 1000}`.split('.')[1];
            divider = `${afkAt / 1000 / 60}`.split('.')[0];
            divider = Number(divider);
            divider = divider * 60;
            remainingSeconds = Number(remainingSeconds) / divider;
            if (Math.round(remainingSeconds) >= 1) afkAt = `${Math.round(afkAt / 1000 / 60)} minute(s) ago.`;
            if (Math.round(remainingSeconds) >= 1) afkAt = `${Math.round(backupAfk / 1000 / 60)} minute(s) and ${Math.round(remainingSeconds)} second(s) ago.`
        }
        else afkAt = `${Math.round(afkAt / 1000)} second(s) ago.`;

        const notAfk = client.createEmbed({
            text: `${message.author}, You are now not AFK!\nAFK Reason: ${afkCheck.Reason}\nAFK: ${afkAt}`,
            color: "BLURPLE",
            footerOne: message.author.tag,
            footerTwo: message.author.displayAvatarURL({ dynamic: true }),
            thumbnail: message.guild.iconURL({ dynamic: true })
        });

        message.member.setNickname(message.author.username, "Not afk anymore").catch((err) => {
            console.log(err);
            message.channel.send({ content: `Error: Couldn't change your name because you have higher role than me or you are the server owner!` })
        })

        message.channel.send({ embeds: [notAfk] });

        afkCheck.deleteOne();
        return;
    }
}