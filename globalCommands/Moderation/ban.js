const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ban")
    .setDefaultPermission(true)
    .setDescription("Ban a member from the server!")
    .addUserOption((option) => option.setName("member").setDescription("The member to ban from the server!").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("The reason to ban this member, Optional!")),
    category: "Moderation",
    usage: "/ban <Member (Mention)>",
    perm: "Ban Members",
    async execute(client, interaction, Discord) {
        const { options, member, user, guild } = interaction;

        const NoPerms = client.createEmbed({
            text: `${user}, You need the permissions \`BAN_MEMBERS\` to kick a member!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: user.displayAvatarURL({ dynamic: true })
        });

        if (!member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.followUp({ embeds: [NoPerms] });

        const mentionedUser = options.getUser("member");

        const serverMember = guild.members.cache.get(mentionedUser.id);

        let testingReason = options.getString("reason");

        let reason;

        if (testingReason) reason = testingReason;

        const NotInServer = client.createEmbed({
            text: `${user}, The member you've mentioned is not in the server!`,
            color: "RED",
            footerOne: user.tag,
            footerTwo: user.displayAvatarURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        if (!serverMember) return interaction.followUp({ embeds: [NotInServer] });
        
        const cannotBanUrSelf = client.createEmbed({
            text: `${user}, You cannot ban your self!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        if (serverMember.user.id === user.id) return interaction.followUp({ embeds: [cannotBanUrSelf] });

        const highestExecutor = member.roles.highest;
        const exePos = highestExecutor.rawPosition;
        const highestTarget = serverMember.roles.highest;
        const tarPos = highestTarget.rawPosition;
        const myHighestRole = guild.me.roles.highest;
        const myhPos = myHighestRole.rawPosition;

        const NotEnoughPerms = client.createEmbed({
            text: `${user}, You cannot ban <@${serverMember.user.id}> since he/she has a higher role than you!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: user.displayAvatarURL({ dynamic: true })
        });

        const roleHierachyError = client.createEmbed({
            text: `${user}, I cannot ban <@${serverMember.user.id}> since his/her role is higher than mine! Please put my role higher than any role!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: user.displayAvatarURL({ dynamic: true })
        });

        if (tarPos > exePos) return interaction.followUp({ embeds: [NotEnoughPerms] });
        if (tarPos > myhPos) return interaction.followUp({ embeds: [roleHierachyError] });

        try {
            serverMember.ban({ reason: reason ? reason : "No Reason Provided" }).catch((err) => console.log(err));

            const youAreBanned = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Banned`, guild.iconURL({ dynamic: true }))
            .setDescription(`${mentionedUser}, You have been banned by <@${user.id}> for **${reason ? reason : "No Reason Provided"}**`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }));

            mentionedUser.send({ embeds: [youAreBanned] }).catch((err) => null);

            const userKicked = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Banned`, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You have succesfuly banned <@${serverMember.user.id}> for **${reason ? reason : "No Reason Provided"}**`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }));

            interaction.followUp({ embeds: [userKicked] });
        } catch (err) {
            console.log(err)
        }
    }
}