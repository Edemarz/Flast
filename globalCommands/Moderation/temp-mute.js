const { SlashCommandBuilder, italic } = require("@discordjs/builders");
const ms = require("ms");
const DB = require("../../models/MuteDB");
const { Permissions, MessageEmbed, InteractionWebhook } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("temp-mute")
    .setDescription("Temporarily mute a user!")
    .setDefaultPermission(true)
    .addUserOption((option) => option.setName("member").setDescription("The member to temporarily mute!").setRequired(true))
    .addNumberOption((option) => option.setName("duration").setDescription("The duration to mute the user for!").setRequired(true))
    .addStringOption((option) => option.setName("duration-type").setDescription("The type of duration to mute the user!").addChoice("seconds", "mute-user-s").addChoice("minutes", "mute-user-m")
    .addChoice("hours", "mute-user-h").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("The reason to mute this user for!")),
    category: "Moderation",
    usage: "/temp-mute <Member (Mention)> <Duration (Numbers Only)> <Type (Second, Minute or Hour)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { options, guild, channel, user, member } =  interaction;

        const NoPerms = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Permission Error`)
        .setDescription(`${user}, You need the permission \`MANAGE_GUILD\` to execute this command!`)
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setTimestamp()
        .setThumbnail(guild.iconURL({ dynamic: true }))

        if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.followUp({ embeds: [NoPerms] });

        const DBCheck = await DB.findOne({
            GuildID: guild.id
        });

        if (!DBCheck) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, Please set up the Mute System first by doing **/set-mute-system**!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        let reason;

        let test = options.getString("reason");
        
        if (test) reason = test;

        const target = options.getUser("member");
        
        const dur = options.getNumber("duration");

        const roles = {
            muteRole: guild.roles.cache.get(DBCheck.MuteRole),
            memberRole: guild.roles.cache.get(DBCheck.MemberRole)
        };

        const serverMember = guild.members.cache.get(target.id);

        const nonExistent = client.createEmbed({
            text: `${user}, The user ${target.tag} is not in the server!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        if (!serverMember) return interaction.followUp({ embeds: [nonExistent] });

        const memHighest = serverMember.roles.highest;
        const memhPos = memHighest.rawPosition;
        const exeHighest = member.roles.highest;
        const exePos = exeHighest.rawPosition;
        const meHighest = guild.me.roles.highest;
        const mePos = meHighest.rawPosition;

        if (memhPos > exePos) return interaction.followUp({ embeds: [
            new MessageEmbed().setAuthor(`${guild.name} Server | Role Issue`, guild.iconURL({ dynamic: true })).setDescription(`${user}, You cannot temporarily mute <@${target.id}> since he/she has a higher role than you!`).setColor("RED").setFooter(guild.name, guild.iconURL({ dynamic: true })).setThumbnail(guild.iconURL({ dynamic: true }))
        ] });
        if (memhPos > mePos) return interaction.followUp({ embeds: [
            new MessageEmbed().setAuthor(`${guild.name} Server | Role Issue`, guild.iconURL({ dynamic: true })).setDescription(`${user}, I cannot temporarily mute <@${target.id}> since he/she has a higher role than me, Please put my role higher!`).setColor("RED").setFooter(guild.name, guild.iconURL({ dynamic: true })).setThumbnail(guild.iconURL({ dynamic: true }))
        ] });

        if (Number.isInteger(dur) === false) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, No decimals or floating point are allowed in the duration!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        if (dur < 10 && options.getString("duration-type") === "mute-user-s") return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You cannot temporarily mute a member for less than 10 seconds!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});


        let type;

        let convDuration;

        if (options.getString("duration-type") === "mute-user-s") type = "s";
        if (options.getString("duration-type") === "mute-user-m") type = "m";
        if (options.getString("duration-type") === "mute-user-h") type = "h";

        if (type === "s") convDuration = dur * 1000;
        if (type === "m") convDuration = dur * 60 * 1000;
        if (type === "h") convDuration = dur * 60 * 60 * 1000;

        try {
            if (serverMember.roles.cache.has(roles.muteRole)) return interaction.followUp({ embeds: [
                client.createEmbed({
                    text: `${user}, <@${target.id}> is already muted!`,
                    color: "RED",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ] });
            if (!serverMember.roles.cache.has(roles.muteRole)) {
                await serverMember.roles.add(roles.muteRole).catch((err) => null);
                await serverMember.roles.remove(roles.memberRole).catch((err) => null);

                const tempMuted = new MessageEmbed()
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setColor("BLURPLE")
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setAuthor(`${guild.name} Server | Temp Mute`, guild.iconURL({ dynamic: true }))
                .setDescription(`${user}, You have temporarily muted <@${target.id}> for ${dur} ${type === "s" ? "Seconds" : type === "m" ? "Minutes" : type === "h" ? "Hours" : "Internal Error"} for **${reason ? reason : "No Reason Provided"}**.`)

                interaction.followUp({ embeds: [tempMuted] });

                const temporarilyMutedUser = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Temp Mute`, guild.iconURL({ dynamic: true }))
                .setDescription(`<@${target.id}>, You have been temporarily muted by ${user} for ${dur} ${type === "s" ? "Seconds" : type === "m" ? "Minutes" : type === "h" ? "Hours" : "Internal Error"} amount of time!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }));

                target.send({ embeds: [temporarilyMutedUser] }).catch((err) => console.log(`${target.tag} has DM's off or he has blocked me, so i cannot send any messages to him!`));
            }

            setTimeout(async () => {
                await serverMember.roles.remove(roles.muteRole).catch((err) => null);
                await serverMember.roles.add(roles.memberRole).catch((err) => null);

                const unmutedFromTemp = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Temp Mute`, guild.iconURL({ dynamic: true }))
                .setDescription(`Successfuly unmuted <@${target.id}> after ${dur} ${type === "s" ? "Seconds" : type === "m" ? "Minutes" : type === "h" ? "Hours" : "Internal Error"} amount of time!\nResponsible Moderator: ${user}`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Automated Message`, client.user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }));

                return channel.send({ embeds: [unmutedFromTemp] })
            }, convDuration)
        } catch (err) { console.log(err) };
    }
}