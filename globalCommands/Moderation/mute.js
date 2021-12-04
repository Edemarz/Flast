const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");
const DB = require("../../models/MuteDB");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("mute")
    .setDefaultPermission(true)
    .setDescription("Mute a member in your server!")
    .addUserOption((option) => option.setName("member").setDescription("The member to mute!").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("The reason this member is getting muted! [OPTIONAL]")),
    category: "Moderation",
    usage: "/mute <Member (Mention)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { options, user, member, guild } = interaction;

        const NoPerms = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Permission Error`)
        .setDescription(`${user}, You need the permission \`MANAGE_GUILD\` to execute this command!`)
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setColor("BLURPLE")
        .setTimestamp()
        .setThumbnail(guild.iconURL({ dynamic: true }))
 
        if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.followUp({ embeds: [NoPerms] });

        let reason;

        if (options.getString("reason")) reason = options.getString("reason");

        const DBCheck = await DB.findOne({
            GuildID: guild.id
        });

        if (!DBCheck) return interaction.followUp({ content: `${user}, Please set up the Mute System first by using /set-mute-system` });

        const target = options.getUser("member");

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
        const meHighest = member.roles.highest;
        const mePos = meHighest.rawPosition;
        const mineHighest = guild.me.roles.highest;
        const minePos = mineHighest.rawPosition;
        const muteRole = guild.roles.cache.get(DBCheck.MuteRole);
        const memberRole = guild.roles.cache.get(DBCheck.MemberRole);

        const notEnoughPerms = client.createEmbed({
            text: `${user}, You cannot mute <@${target.id}> since he/she has a higher role than you!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        const roleHierachyIssue = client.createEmbed({
            text: `${user}, I cannot mute <@${target.id}> since he/she has a higher role than me!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        })

        if (memhPos > mePos) return interaction.followUp({ embeds: [notEnoughPerms] });
        if (memhPos > minePos) return interaction.followUp({ embeds: [roleHierachyIssue] });

        try {
            const mutedAlready = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Muted Already`)
            .setDescription(`${user}, Unable to mute ${target} since he/she is already muted!`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))

            if (serverMember.roles.cache.has(DBCheck.MuteRole)) return interaction.followUp({ embeds: [mutedAlready] });

            let failed = false;
            if (!serverMember.roles.cache.has(DBCheck.MuteRole)) {
                await serverMember.roles.add(muteRole, reason ? reason : "No Reason Provided").catch((err) => {
                    interaction.followUp({ content: `${user}, Cannot mute <@${target.id}> since the mute role is a bot role which is not assignable to users!`});
                    console.log(err)
                    failed = true;
                    return
                });

                await serverMember.roles.remove(memberRole).catch((err) => null);
            };

            if (failed) return;

            const mutedLol = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Mute`)
            .setDescription(`${user}, You have muted ${target} for **${reason ? reason : "No Reason Provided"}**!`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))

            interaction.followUp({ embeds: [mutedLol] });

            const mutedUserX = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Mute`)
            .setDescription(`${target}, You have been muted by ${user} for **${reason ? reason : "No Reason Provided"}**!`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))

            target.send({ embeds: [mutedUserX] }).catch((err) => null)
        } catch (err) { console.log(err) };
    }
}