const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("purge")
    .setDefaultPermission(true)
    .setDescription("Purge an amount of messages, We cannot delete messages older than 2 weeks!")
    .addNumberOption((option) => option.setName("amount").setDescription("The amount of messages to delete!").setRequired(true)),
    category: "Moderation",
    usage: "/purge <Amount (No Coma's Allowed)>",
    perm: "Manage Messages",
    async execute(client, interaction, Discord) {
        const { options, user, member, guild, channel } = interaction;

        const NoPerms = client.createEmbed({
            text: `${user}, You need the permissions \`MANAGE_MESSAGES\` to kick a member!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: user.displayAvatarURL({ dynamic: true })
        });

        if (!member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.followUp({ embeds: [NoPerms] });
        
        const amount = options.getNumber("amount");

        const noDecimalAllowed = client.createEmbed({
            text: `${user}, No decimals are allowed in the amount!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        });

        if (Number.isInteger(amount) === false) return interaction.followUp({ embeds: [noDecimalAllowed] });
        if (amount >= 100) return interaction.followUp({ embeds: [client.createEmbed({
            text: `${user}, The amount must not exceed or be equal to 100!`,
            color: "RED",
            footerOne: guild.name,
            footerTwo: guild.iconURL({ dynamic: true }),
            thumbnail: guild.iconURL({ dynamic: true })
        })]});

        channel.bulkDelete(amount, { filterOld: true }).then((msgs) => {
            const deletedMessages = new MessageEmbed()
            .setAuthor(`${guild.name} Server | Purge`)
            .setDescription(`${user}, You have deleted ${msgs.size} amount of messages in <#${channel.id}>!`)
            .setColor("BLURPLE")
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))

            return interaction.channel.send({ embeds: [deletedMessages] });
        });
    }
}