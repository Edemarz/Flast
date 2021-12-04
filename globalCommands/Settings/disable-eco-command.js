//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");
const ValidatePermission = require('../../Functions/ValidatePermission');
const EcoSettings = require("../../models/EcoSettings");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("disable-economy-command")
    .setDefaultPermission(true)
    .setDescription("Disable a specific Economy Command!")
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

        const diabled = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Disable Economy Command`)
            .setDescription(`${user}, The economy command **${cmdOption}** has been disabled!`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))

        if (SearchEco) {
            await SearchEco.Disabled.Commands.push(cmdOption);

            await SearchEco.updateOne({
                GuildID: guild.id,
                Disabled: SearchEco.Disabled,
                Amount: SearchEco.Amount + 1
            });

            return interaction.followUp({ embeds: [diabled] });
        };

        if (!SearchEco) {
            await new EcoSettings({
                GuildID: guild.id,
                Disabled: { Commands: [cmdOption] },
                Amount: 1
            }).save()

            return interaction.followUp({ embeds: [diabled] });
        };
    }
}