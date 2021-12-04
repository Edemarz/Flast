//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");
const ValidatePermission = require('../../Functions/ValidatePermission');
const EcoSettings = require("../../models/EcoSettings");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("enable-economy-command")
    .setDefaultPermission(true)
    .setDescription("Enable a specific Economy Command!")
    .addStringOption((option) => option.setName("command").setDescription("The Economy Command to disable!").setRequired(true)),
    category: "Settings",
    usage: "/disable-economy-command <Command>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { options, member, user, guild } = interaction;

        await ValidatePermission({
            Flag: Permissions.FLAGS.MANAGE_GUILD,
            flagName: "MANAGE_GUILD",
            user: user,
            member: member,
            interaction: interaction
        });
        
        const cmdOption = options.getString("command");
        const ecoCommands = [];

        await client.commands.filter((cmd) => cmd.category == "Economy").forEach((command) => {
            ecoCommands.push(command.data.name)
        });

        if (!ecoCommands.includes(cmdOption)) return interaction.followUp({ embeds: [
            new MessageEmbed()
            .setAuthor(`${guild.name} Server | Disable Economy Command`)
            .setDescription(`${user}, The economy command **${cmdOption}** does not exist, Here are the valid economy commands:\n\n${(ecoCommands).map((c) => `- ${c}`).join("\n").toString()}`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))
        ]});

        const SearchEco = await EcoSettings.findOne({
            GuildID: guild.id
        });

        if (!SearchEco) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The economy command **${cmdOption}** is not disabled, therefore you cannot enable it!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        if (SearchEco) {
            const asb = [];
            const notFiltered = [];
            await SearchEco.Disabled.Commands.forEach((co) => {
                if (co == cmdOption) asb.push(co);
                notFiltered.push(co)
            });

            if (asb.length < 1) return interaction.followUp({ embeds: [
                client.createEmbed({
                    text: `${user}, The economy command **${cmdOption}** is not disabled, therefore you cannot enable it!`,
                    color: "RED",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ] });

            const filtered = [];

            await notFiltered.filter((com) => com != cmdOption).forEach((com) => filtered.push(com));

            await SearchEco.updateOne({
                GuildID: guild.id,
                Disabled: { Commands: filtered },
                Amount: SearchEco.Amount - 1
            });

            return interaction.followUp({ embeds: [
                new MessageEmbed()
                .setAuthor(`${guild.name} Server | Enable / Disable Command`, guild.iconURL({ dynamic: true }))
                .setDescription(`${user}, You have enabled the economy command **${cmdOption}**. Have Fun!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))
            ]})
        }
    }
}