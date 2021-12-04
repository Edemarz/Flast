const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDefaultPermission(true)
    .setDescription(`Displays all the bot commands and categories!`)
    .addStringOption((option) => option.setName("category").setDescription("Get help about a specific category! [OPTIONAL]"))
    .addStringOption((option) => option.setName("command").setDescription("Get help about a specific command! [OPTIONAL]")),
    category: "Information",
    usage: "/help <category [Optional] / command [Optional]>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const { member, user, options, guild } = interaction;
        const theCat = options.getString("category")?.toLowerCase();
        const spefCommand = options.getString("command")?.toLowerCase();

        const errorNotBoth = client.createEmbed({
            text: `${user}, You cannot specify the category and command at the same time!`,
            color: "RED",
            thumbnail: guild.iconURL({ dynamic: true }),
            footerOne: client.user.tag,
            footerTwo: client.user.displayAvatarURL({ dynamic: true })
        });

        if (theCat && spefCommand) return interaction.followUp({ embeds: [errorNotBoth] })

        if (theCat && !spefCommand) {
            const InvalidCat = client.createEmbed({
                text: `${user}, The category **${theCat}** is invalid!\nList of Categories:\n${(client.categories).map((cat) => `- ${cat}`).join('\n')}`,
                color: "BLURPLE",
                thumbnail: guild.iconURL({ dynamic: true }),
                footerOne: user.tag,
                footerTwo: user.displayAvatarURL({ dynamic: true })
            });

            console.log(client.capitalizeFirst(theCat))

            if (!client.categories.includes(client.capitalizeFirst(theCat))) return interaction.followUp({ embeds: [InvalidCat] });

            const cmdCat = await client.commands.filter((command) => command.category && command.category == client.capitalizeFirst(theCat) && command.data.name);

            const cmdInfo = new MessageEmbed()
            .setTitle(`${client.user.username} Commands | ${client.capitalizeFirst(theCat)} Category`)
            .setDescription((cmdCat).map((cmd) => `\`/${cmd.data.name}\` - ${cmd.data.description} (Usage: ${cmd.usage})`).join('\n').toString())
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))

            return interaction.followUp({ embeds: [cmdInfo] });
        } else if (spefCommand && !theCat) {
            const commandInfo = client.commands.get(spefCommand);

            const notExisting = new MessageEmbed()
            .setTitle(`${client.user.username} Error`)
            .setDescription(`${user}, The command **${spefCommand}** does not exist!\nList of available Commands:\n${(client.commands).map((cmd) => `- ${cmd.data.name}`).join('\n')}`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true}))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))

            if (!commandInfo) return interaction.followUp({ embeds: [notExisting] });

            const spefCmdInfo = new MessageEmbed()
            .setTitle(`${client.user.username} Command | ${spefCommand}`)
            .setDescription(`Command Name:\n${commandInfo.data.name}\nCommand Description: ${commandInfo.data.description}\nCommand Usage: ${commandInfo.usage}\nRequired Permissions: ${commandInfo.requiredPermission ? commandInfo.requiredPermission?.toUpperCase() : "No Permission Required"}`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))

            return interaction.followUp({ embeds: [spefCmdInfo] });
        } else if (!spefCommand && !theCat) {
            //Dropdown
            const catInArray = client.categories;

            const generalDropdown = new MessageSelectMenu()
            .addOptions(
                {
                    label: "Economy",
                    value: "economy-dropdown--help",
                    description: "Displays the Economy Category!",
                    emoji: "🪙"
                },
                {
                    label: "Moderation",
                    value: "mod-dropdown--help",
                    description: "Displays the Moderation Category!",
                    emoji: "⚒️"
                },
                {
                    label: "Music",
                    value: "music-dropdown--help",
                    description: "Displays the Music Category!",
                    emoji: "🎶"
                },
                {
                    label: "Information",
                    value: "info-dropdown--help",
                    description: "Displays the Information Category!",
                    emoji: "🔎"
                },
                {
                    label: "Fun",
                    value: "fun-dropdown--help",
                    description: "Displays the Fun Category!",
                    emoji: "🎲"
                },
                {
                    label: "Tools",
                    value: "tools-dropdown--help",
                    description: "Displays the Tool Category!",
                    emoji: "🛠️"
                },
                {
                    label: "Settings",
                    value: "settings-dropdown--help",
                    description: "Displays the Settings Category!",
                    emoji: "⚙️"
                },
                {
                    label: "Birthday",
                    value: "birthday-dropdown--help",
                    description: "Displays the Birthday Category!",
                    emoji: "🥞"
                },
                {
                    label: "Moderator-Tools",
                    value: "moderator-tools-dropdown--help",
                    description: "Displays the Moderator Tools Category!",
                    emoji: "🛠️"
                },
                {
                    label: "Ticket",
                    value: "ticket-dropdown--help",
                    description: "Displays the Ticket Category!",
                    emoji: "📧"
                }
            )
            .setCustomId("help-drop")
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Get information about a specific category!");

            const LinksBTN = new MessageButton()
            .setStyle("PRIMARY")
            .setCustomId("link-btn-prim")
            .setLabel("Links!")

            const everyUtil = new MessageActionRow().addComponents([generalDropdown]);

            const anotherComp = new MessageActionRow().addComponents([LinksBTN])

            //Embed
            const generalHelpEmbed = new MessageEmbed()
            .setTitle(`${client.user.username} Help Command`)
            .setDescription(`This is the general help command, use \`/help <Category / Command [OPTIONAL]>\` to get help about a specific category/command.\nUse the dropdown below for information about a specific category!\n[Invite Me!](${process.env.INVITE_URL})`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter(`${client.user.username} Inc.`, client.user.displayAvatarURL({ dynamic: true }))

            //Send The Message along with the Dropdown!

            return interaction.followUp({ embeds: [generalHelpEmbed], components: [everyUtil, anotherComp] })
        }
    }
}