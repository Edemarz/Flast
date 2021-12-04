const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("kick")
    .setDefaultPermission(true)
    .setDescription("Kick a member from the server!")
    .addUserOption((option) => option.setName("member").setDescription("The member to kick from the server!").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("The reason to kick this member, Optional!")),
    category: "Moderation",
    usage: "/kick <Member (Mention)>",
    perm: "Kick Members",
    async execute(client, interaction, Discord) {
        const { options, member, user, guild } = interaction;

        const NoPerms = client.createEmbed({
            text: `${user}, You need the permissions \`KICK_MEMBERS\` to kick a member!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: user.displayAvatarURL({ dynamic: true })
        });

        if (!member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return interaction.followUp({ embeds: [NoPerms] });

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

        const cannotKickUrSelf = client.createEmbed({
            text: `${user}, You cannot kick your self!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        if (serverMember.user.id === user.id) return interaction.followUp({ embeds: [cannotKickUrSelf] });

        const highestExecutor = member.roles.highest;
        const exePos = highestExecutor.rawPosition;
        const highestTarget = serverMember.roles.highest;
        const tarPos = highestTarget.rawPosition;
        const myHighestRole = guild.me.roles.highest;
        const myhPos = myHighestRole.rawPosition;

        const NotEnoughPerms = client.createEmbed({
            text: `${user}, You cannot kick <@${serverMember.user.id}> since he/she has a higher role than you!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: user.displayAvatarURL({ dynamic: true })
        });

        const roleHierachyError = client.createEmbed({
            text: `${user}, I cannot kick <@${serverMember.user.id}> since his/her role is higher than mine! Please put my role higher than any role!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: user.displayAvatarURL({ dynamic: true })
        });

        if (tarPos > exePos) return interaction.followUp({ embeds: [NotEnoughPerms] });
        if (tarPos > myhPos) return interaction.followUp({ embeds: [roleHierachyError] });

        try {
            serverMember.kick(reason ? reason : "No Reason Provided").catch((err) => console.log(err));

            const youAreKicked = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Kicked`, guild.iconURL({ dynamic: true }))
            .setDescription(`${mentionedUser}, You have been kicked by <@${user.id}> for **${reason ? reason : "No Reason Provided"}**`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }));

            mentionedUser.send({ embeds: [youAreKicked] }).catch((err) => console.log(err));

            const userKicked = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Kicked`, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You have succesfuly kicked <@${serverMember.user.id}> for **${reason ? reason : "No Reason Provided"}**`)
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