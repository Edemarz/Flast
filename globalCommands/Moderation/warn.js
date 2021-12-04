const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require("../../models/WarnDB");
const { Permissions, MessageEmbed, Message } = require("discord.js");
const randomId = require("random-id");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDefaultPermission(true)
        .setDescription("Warn a member in the server!")
    .addUserOption((option) => option.setName("member").setDescription("The member to warn!").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("The reason on why this member is getting warned!").setRequired(true)),
    category: "Moderation",
    usage: "/warn <Member (Mention)> <Reason>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { options, member, channel, guild, user } = interaction;

        if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.followUp({ embeds: [
            new MessageEmbed()
            .setAuthor(`${guild.name} Server | Permission Issue`)
            .setDescription(`${user}, You need the permissions \`\`\`MANAGE_GUILD\`\`\` to execute this command!`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        ] });

        const target = options.getUser("member");
        const reason = options.getString("reason");

        const data = {
            length: 10,
            pattern: 'aA0'
        };

        const randId = randomId(data.length, data.pattern);

        const completeId = `${target.id}-${randId}`;

        const serverMember = guild.members.cache.get(target.id);

        if (!serverMember) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The user you've mentioned is not in the server!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const warnCheck = await DB.findOne({
            GuildID: guild.id,
            UserID: target.id
        });

        if (warnCheck) {
            await warnCheck.Warns.push({ moderator: `${user.tag} (${user.id})`, warnedAt: new Date(interaction.createdTimestamp).toLocaleDateString(), reason: reason, warningId: completeId });
            await warnCheck.updateOne({
                GuildID: guild.id,
                UserID: target.id,
                Warns: warnCheck.Warns,
                Amount: warnCheck.Amount + 1
            });

            const Warned = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Warn`, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You have warned <@${target.id}> for **${reason}**.`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))

            interaction.followUp({ embeds: [Warned] });

            const youHaveBeenWarned = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Warn`, guild.iconURL({ dynamic: true }))
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setDescription(`<@${target.id}>, You have been warned by ${user} for **${reason}**.`)
            .setThumbnail(guild.iconURL({ dynamic: true }))

            target.send({ embeds: [youHaveBeenWarned] }).catch((err) => null);
            return;
        };

        if (!warnCheck) {
            new DB({
                GuildID: guild.id,
                UserID: user.id,
                Warns: [{ moderator: `${user.tag} (${user.id})`, warnedAt: new Date(interaction.createdTimestamp).toLocaleDateString(), reason: reason, warningId: completeId }],
                Amount: 1
            }).save();

            const Warned = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Warn`, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, You have warned <@${target.id}> for **${reason}**.`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))

            interaction.followUp({ embeds: [Warned] });

            const youHaveBeenWarned = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Warn`, guild.iconURL({ dynamic: true }))
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setDescription(`<@${target}>, You have been warned by ${user} for **${reason}**.`)
            .setThumbnail(guild.iconURL({ dynamic: true }))

            target.send({ embeds: [youHaveBeenWarned] });
            return;
        }
    }
}