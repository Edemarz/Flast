const { MessageEmbed, MessageActionRow, MessageButton, Message, Permissions, Collection } = require("discord.js");
const TicketDB = require("../../models/TicketDB");
const TicketSystem = require("../../models/TicketSystemDB");
const MessageDB = require("../../models/TicketMessageDB");
const ExtraUser = require("../../models/extraTicketUser");
const TicketMemberDeletionDB = require("../../models/TicketMemberDeletion");
const ValidateSeconds = require("../../Functions/ValidateSeconds");
const WorkDB = require("../../models/WorkDB");
const EcoDB = require("../../models/EconomyDB");

const cooldowns = new Map();

module.exports = async (Discord, client, interaction) => {
    if (interaction.isCommand()) {
        const { guild, member, user } = interaction;
        await interaction.deferReply({ ephemeral: false }).catch(() => null);

        const command = client.commands.get(interaction.commandName);

        if (command) try {
            if (command.requiredPermission) {
                const errorNoPerms = new MessageEmbed()
                .setDescription(`${user}, You need to have the \`\`\`${command.requiredPermission}\`\`\` permission to execute this command!`)
                .setColor("BLURPLE")
                .setFooter(user.tag, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }));

                if (!interaction.member.permissions.has(command.requiredPermission)) return interaction.followUp({ embeds: [errorNoPerms] });
            }

            if (command.cooldown) {
                if (!cooldowns.get(command.data.name)) cooldowns.set(command.data.name, new Map());

                const current_time = Date.now();

                const time_stamps = cooldowns.get(command.data.name);

                const cooldown_amount = (command.cooldown) * 1000; //Gets the ms (Mili-Seconds);

                if (time_stamps.get(interaction.user.id)) {
                    const expiration_time = time_stamps.get(interaction.user.id) + cooldown_amount; //The cooldowns;

                    if (current_time < expiration_time) {
                        let time_left = await Math.round((expiration_time - current_time) / 1000);

                        time_left = `${Math.round(time_left / 60)} minute(s)`;

                        const pleaseWaitForCooldown = new MessageEmbed()
                            .setDescription(`${interaction.user}, Please wait ${time_left} before using this command again!`)
                            .setColor("RED")
                            .setTimestamp()
                            .setFooter(interaction.guild.name, interaction.guild.iconURL())

                        return interaction.followUp({ embeds: [pleaseWaitForCooldown] })
                    }
                }

                time_stamps.set(interaction.user.id, current_time);

                setTimeout(() => time_stamps.delete(interaction.user.id), cooldown_amount)
            }

            command.execute(client, interaction, Discord);
        } catch (err) { client.colorText(err) };
    };

    if (interaction.isSelectMenu()) {
        const { guild, member, user } = interaction;
        await interaction.deferReply({ ephemeral: true }).catch(() => null);

        if (interaction.customId === "work-dropdown") {
            const values = [];

            for (const val of client.jobs) {
                values.push(val);
            };

            const ind = await values.findIndex((vale) => vale.value === interaction.values[0]);

            console.log(ind)

            if (ind?.toString() == "-1") return;

            if (interaction.values[0] === values[ind].value) {
                await new WorkDB({
                    UserID: user.id,
                    Work: { job: values[ind].job, salary: values[ind].salaryRange, allowDeath: values[ind].hasDeath ? true : false }
                }).save();

                interaction.message.delete().catch((err) => null);
                interaction.followUp({ content: `${user}, You have picked your job as a ${values[ind].job}, Please do the work command again!`})
            }
        }

        if (interaction.customId === "help-drop") {
            if (interaction.values[0] === "economy-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Economy" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Economy Category yet!" });

                const economyMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Economy`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [economyMenu], ephemeral: true })
            } else if (interaction.values[0] === "mod-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Moderation" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Moderation Category yet!" });

                const modMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Moderation`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [modMenu], ephemeral: true })
            } else if (interaction.values[0] === "music-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Music" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Music Category yet!" });

                const musicMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Music`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [musicMenu], ephemeral: true })
            } else if (interaction.values[0] === "info-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Information" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Information Category yet!" });

                const infoMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Information`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [infoMenu], ephemeral: true })
            } else if (interaction.values[0] === "fun-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Fun" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Fun Category yet!" });

                const funMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Fun`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [funMenu], ephemeral: true })
            } else if (interaction.values[0] === "tools-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Tools" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Tools Category yet!" });

                const toolMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Tools`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [toolMenu], ephemeral: true })
            } else if (interaction.values[0] === "settings-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Settings" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Fun Category yet!" });

                const setMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Settings`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [setMenu], ephemeral: true })
            } else if (interaction.values[0] === "birthday-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Birthday" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Birthday Category yet!" });

                const setMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Birthday`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [setMenu], ephemeral: true })
            } else if (interaction.values[0] === "moderator-tools-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Moderator-tools" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Moderator-Tools Category yet!" });

                const setMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Moderator-Tools`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [setMenu], ephemeral: true })
            } else if (interaction.values[0] === "ticket-dropdown--help") {
                const commands = client.commands.filter((command) => command.category && command.category == "Ticket" && command.data.name);

                if (!commands) return interaction.followUp({ content: "There is no commands in the Ticket Category yet!" });

                const setMenu = new MessageEmbed()
                .setTitle(`${client.user.username} Commands | Ticket`)
                .setDescription((commands).map((command) => `\`/${command.data.name}\` - ${command.data.description} (Usage: ${command.usage})`).join('\n').toString())
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(`Action by: ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [setMenu], ephemeral: true })
            }
        }
    }

    if (interaction.isButton()) {
        const { user, member, guild } = interaction;
        // await interaction.deferReply({ ephemeral: false }).catch(() => null);

        if (interaction.customId === "link-btn-prim") {
            const Links = new MessageEmbed()
            .setAuthor(`${client.user.username} Links | ${guild.name} Server`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setDescription(`[Invite Me!](https://discord.com/api/oauth2/authorize?client_id=913745300382965791&permissions=8&scope=bot%20applications.commands)\n[Support Server](https://discord.gg/SYruTEZw2t)`)

            const button1 = new MessageButton()
            .setStyle("LINK")
            .setLabel("Invite Me!")
            .setURL("https://discord.com/api/oauth2/authorize?client_id=913745300382965791&permissions=8&scope=bot%20applications.commands")

            const button2 = new MessageButton()
            .setStyle("LINK")
            .setLabel("Support Server")
            .setURL("https://discord.gg/SYruTEZw2t");

            const allButtons = new MessageActionRow().addComponents([button1, button2]);

            return interaction.reply({ embeds: [Links], components: [allButtons], ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        if (!interaction.guild || !interaction.channel || interaction.user.bot) return;

        await interaction.deferReply({ ephemeral: false }).catch(() => null);

        if (interaction.customId === "ticket-button") {

            const checkingMsg = await MessageDB.findOne({ GuildID: interaction.guild.id, MessageID: interaction.message.id });

            if (!checkingMsg) return

            await interaction.deferReply({ ephemeral: false }).catch(() => null);

            const checkingTicketSystem = await TicketSystem.findOne({ GuildID: interaction.guild.id });

            const TicketSystemRedone = new MessageEmbed()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${interaction.user}, For some reason the Ticket System has not been saved in the Database! Please tell an administrator to set it up again!`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            if (!checkingTicketSystem) return interaction.followUp({ embeds: [TicketSystemRedone] });

            const checkingTicketDB = await TicketDB.findOne({ GuildID: interaction.guild.id, User: interaction.user.id });

            if (checkingTicketDB) {
                const AlreadyHaveATicket = new MessageEmbed()
                    .setTitle("Ticket Already Exist")
                    .setDescription(`${interaction.user}, You already have a ticket opened! Head over to <#${checkingTicketDB.ChannelID}> to go to your ticket!`)
                    .setColor("BLURPLE")
                    .setTimestamp()
                    .setFooter(interaction.guild.name, interaction.guild.iconURL())
                await interaction.followUp({ embeds: [AlreadyHaveATicket] }).then((message) => {
                    setTimeout(() => {
                        try {
                            message.delete()
                        } catch (err) {
                            console.log(err)
                        }
                    }, 5000)
                })
                return;
            };

            const role = await interaction.guild.roles.cache.get(checkingTicketSystem.TicketManager)

            const channel = await interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
                type: "GUILD_TEXT",
                reason: `${interaction.user.tag} Opened a ticket!`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]
                    },
                    {
                        id: role,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]
                    },
                    {
                        id: interaction.user,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]
                    }
                ]
            });

            const newGuild = await new TicketDB({ GuildID: interaction.guild.id, ChannelID: channel.id, User: interaction.user.id });
            await newGuild.save()

            const embedOpened = new MessageEmbed()
                .setTitle("Ticket Support")
                .setDescription(`${interaction.user}, You have opened a ticket, Please wait for support to arrive and if support doesn't arrive in 2 hours please ping <@&${role.id}>!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL());

            const componentRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("⛔")
                    .setLabel("Close Ticket")
                    .setCustomId("close-ticket--red")
                    .setStyle("DANGER"),
                new MessageButton()
                    .setEmoji("📔")
                    .setLabel("Claim Ticket")
                    .setCustomId("claim-ticket--book")
                    .setStyle("SUCCESS"),
                new MessageButton()
                    .setEmoji("🔒")
                    .setLabel("Lock Ticket")
                    .setCustomId("lock-ticket--lock")
                    .setStyle("PRIMARY")
            )

            await channel.send({ embeds: [embedOpened], components: [componentRow] })


            const ticketOpened = new MessageEmbed()
                .setTitle("Ticket Opened")
                .setDescription(`${interaction.user}, You have opened a ticket, head over to <#${channel.id}> for your ticket!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            await interaction.followUp({ embeds: [ticketOpened] }).then((message) => setTimeout(() => {
                setTimeout(() => {
                    try {
                        message.delete()
                    } catch (err) {
                        console.log(err)
                    }
                }, 5000)
            }));
        }

        if (interaction.customId === "close-ticket--red") {
            await interaction.deferReply({ ephemeral: false }).catch(() => null);

            const TicketDBCheck = await TicketDB.findOne({ GuildID: interaction.guild.id, ChannelID: interaction.channel.id });


            if (!TicketDBCheck) {
                const ticketName = interaction.channel.name.split('-');

                await ticketName.shift();

                const ErrorNotInDB = new MessageEmbed()
                    .setAuthor(`${interaction.guild.name} Server | Error`)
                    .setDescription(`${interaction.user}, The ticket \`${ticketName.join("-")}\` is not saved in the Database! Please ask an admin/mod to delete this ticket and open a new one!`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(interaction.guild.name, interaction.guild.iconURL())

                return interaction.followUp({ embeds: [ErrorNotInDB] });
            }

            const TicketSystemCheck = await TicketSystem.findOne({ GuildID: interaction.guild.id });

            const ErrorNoDB = new MessageEmbed()
                .setTimestamp()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${interaction.user}, This server is not saved in the Database! Please setup the ticket system again!`)
                .setFooter(interaction.guild.name, interaction.guild.iconURL())
                .setColor("RED")

            if (!TicketSystemCheck) return interaction.followUp({ embeds: [ErrorNoDB] })

            const CheckingMemberDeletion = await TicketMemberDeletionDB.findOne({
                GuildID: interaction.guild.id
            });

            if (CheckingMemberDeletion) {
                const channel = await interaction.guild.channels.cache.get(TicketDBCheck.ChannelID);

                const ExtraUserCheck = await ExtraUser.findOne({
                    GuildID: interaction.guild.id,
                    Ticket: interaction.channel.id
                });

                try {
                    const deletingIn5Seconds = new MessageEmbed()
                        .setDescription(`Deleting the ticket **${channel.name}** in 5 seconds!`)
                        .setColor("BLURPLE")

                    interaction.followUp({ embeds: [deletingIn5Seconds] });

                    setTimeout(async () => {
                        await channel.delete();
                        await TicketDBCheck.deleteOne();
                        if (ExtraUserCheck) await ExtraUserCheck.deleteOne();
                    }, 5000)
                } catch (err) {
                    console.log(err); //Error handler so the bot doesnt stop UwU
                }
                return
            }

            const NoRole = new MessageEmbed()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${interaction.user}, Only people with the Ticket Manager role (<@&${TicketSystemCheck.TicketManager}>) can close or manage a ticket!`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            if (!interaction.member.roles.cache.has(TicketSystemCheck.TicketManager)) return interaction.followUp({ embeds: [NoRole] });

            const channel = await interaction.guild.channels.cache.get(TicketDBCheck.ChannelID);

            const ExtraUserCheck = await ExtraUser.findOne({
                GuildID: interaction.guild.id,
                Ticket: interaction.channel.id
            });

            try {
                const deletingIn5Seconds = new MessageEmbed()
                    .setDescription(`Deleting the ticket **${channel.name}** in 5 seconds!`)
                    .setColor("BLURPLE")

                interaction.followUp({ embeds: [deletingIn5Seconds] });

                setTimeout(async () => {
                    await channel.delete();
                    await TicketDBCheck.deleteOne();
                    if (ExtraUserCheck) await ExtraUserCheck.deleteOne();
                }, 5000)
            } catch (err) {
                console.warn(err)
            }
        }

        if (interaction.customId === "claim-ticket--book") {
            await interaction.deferReply({ ephemeral: false }).catch(() => null);

            const TicketDBCheck = await TicketDB.findOne({ GuildID: interaction.guild.id, ChannelID: interaction.channel.id });

            const ErrorNotInDB = new MessageEmbed()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${interaction.user}, Your ticket is not saved in the Database! Please ask an admin/mod to delete this ticket and open a new one!`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            if (!TicketDBCheck) return interaction.followUp({ embeds: [ErrorNotInDB] });

            const TicketSystemCheck = await TicketSystem.findOne({ GuildID: interaction.guild.id });

            const ErrorNoDB = new MessageEmbed()
                .setTimestamp()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${interaction.user}, This server is not saved in the Database! Please setup the ticket system again!`)
                .setFooter(interaction.guild.name, interaction.guild.iconURL())
                .setColor("RED")

            if (!TicketSystemCheck) return interaction.followUp({ embeds: [ErrorNoDB] });

            const NoRole = new MessageEmbed()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${interaction.user}, Only people with the Ticket Manager role (<@&${TicketSystemCheck.TicketManager}>) can claim or manage a ticket!`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            if (!interaction.member.roles.cache.has(TicketSystemCheck.TicketManager)) return interaction.followUp({ embeds: [NoRole] })

            const channel = await interaction.guild.channels.cache.get(TicketDBCheck.ChannelID);

            if (!channel) return interaction.followUp({ content: "An error has occured, please try it again!" });

            const role = await interaction.guild.roles.cache.get(TicketSystemCheck.TicketManager);

            if (!role) return interaction.followUp({ content: "An error has occured, please try it again!" });

            await channel.permissionOverwrites.edit(interaction.user, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true
            });

            await channel.permissionOverwrites.edit(role, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
                ADD_REACTIONS: false
            });

            const ticketClaimed = new MessageEmbed()
                .setTitle("Ticket Claimed")
                .setDescription(`${interaction.user}, You have claimed this ticket as a <@&${TicketSystemCheck.TicketManager}>, Now no one can see or send a message in this ticket unless they have the permission \`ADMINISTRATOR\`.`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            interaction.followUp({ embeds: [ticketClaimed] })
        }

        if (interaction.customId === "lock-ticket--lock") {
            await interaction.deferReply({ ephemeral: false }).catch(() => null);

            const TicketDBCheck = await TicketDB.findOne({ GuildID: interaction.guild.id, ChannelID: interaction.channel.id });

            const ErrorNotInDB = new MessageEmbed()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${interaction.user}, Your ticket is not saved in the Database! Please ask an admin/mod to delete this ticket and open a new one!`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            if (!TicketDBCheck) return interaction.followUp({ embeds: [ErrorNotInDB] });

            const TicketSystemCheck = await TicketSystem.findOne({ GuildID: interaction.guild.id });

            const ErrorNoDB = new MessageEmbed()
                .setTimestamp()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${interaction.user}, This server is not saved in the Database! Please setup the ticket system again!`)
                .setFooter(interaction.guild.name, interaction.guild.iconURL())
                .setColor("RED")

            if (!TicketSystemCheck) return interaction.followUp({ embeds: [ErrorNoDB] });

            const NoRole = new MessageEmbed()
                .setAuthor(`${interaction.guild.name} Server | Error`)
                .setDescription(`${interaction.user}, Only people with the Ticket Manager role (<@&${TicketSystemCheck.TicketManager}>) can lock or manage a ticket!`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            if (!interaction.member.roles.cache.has(TicketSystemCheck.TicketManager)) return interaction.followUp({ embeds: [NoRole] })

            const channel = await interaction.guild.channels.cache.get(TicketDBCheck.ChannelID);

            if (!channel) return interaction.followUp({ content: "An error has occured, please try it again!" });

            interaction.guild.roles.cache.forEach(async (role) => {
                await channel.permissionOverwrites.edit(role, {
                    VIEW_CHANNEL: false,
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            });

            const ticketLocked = new MessageEmbed()
                .setTitle("Ticket Claimed")
                .setDescription(`${interaction.user}, You have lock this ticket as a <@&${TicketSystemCheck.TicketManager}>, Now no one can see or send a message in this ticket except for the user that opened this ticket the one locking it.`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(interaction.guild.name, interaction.guild.iconURL())

            interaction.followUp({ embeds: [ticketLocked] })
        }
    }
}
//590 Lines