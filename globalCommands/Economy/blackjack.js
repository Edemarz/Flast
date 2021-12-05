//Importing DB & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const EcoDB = require("../../models/EconomyDB");
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDefaultPermission(true)
        .setDescription("Play a blackjack game with me!")
        .addNumberOption((option) => option.setName("amount").setDescription("The amount of Flast Cash to gamble in a blackjack game!").setRequired(true)),
    category: "Economy",
    usage: "/blackjack <Amount (Flast Cash)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Interaction
        const { member, guild, options, user } = interaction;
        //Checking user's DB
        const UserDB = await EcoDB.findOne({
            UserID: user.id
        });

        let amount = options.getNumber("amount")

        if (!UserDB) {
            await new EcoDB({
                UserID: user.id,
                Wallet: 0,
                Bank: 0
            }).save();

            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(`${guild.name} Server | Blackjack`, guild.iconURL({ dynamic: true }))
                        .setDescription(`${user}, You do not have any flast cash in your wallet, Work to get some flast cash first!`)
                        .setColor("RED")
                        .setTimestamp()
                        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                ]
            });
        };

        if (Number.isInteger(amount) === false) return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Blackjack`, guild.iconURL({ dynamic: true }))
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                    .setDescription(`${user}, The flast cash amount to gamble in a blackjack game cannot be a decimal, instead, it has to be an integer.`)
            ]
        });

        if (amount > UserDB.Wallet) return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Blackjack`)
                    .setDescription(`${user}, The bet amount cannot be higher than the amount in your wallet!`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            ]
        });

        const cards = ["♦️ K", "♦️ J", "♦️ L", "♦️ A", "♦️ B"];
        const numCards = ["♦️ 3", "♦️ 5", "♦️ 7", "♦️ 4", "♦️ 2"];
        const startingAmount = Math.floor(Math.random() * 18) + 1;
        const flastAmount = Math.floor(Math.random() * 18) + 1;

        const userCards = [cards[Math.floor(Math.random() * cards.length)], numCards[Math.floor(Math.random() * numCards.length)]];
        const flastCards = [cards[Math.floor(Math.random() * cards.length)], numCards[Math.floor(Math.random() * numCards.length)]];

        const blackjackEmbed = new MessageEmbed()
            .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
            .setDescription(`${user}, Don't get over 21 or you'll be busted :wink:`)
            .addFields(
                {
                    name: `${user.username} (Player)`,
                    value: `Cards - ${(userCards).map((c) => `${c}`).join(' ').toString()}\nTotal - ${startingAmount}\n\nK, J, L = 5; A, B = 10;`
                },
                {
                    name: `${client.user.username} (Dealer)`,
                    value: `Cards - ${(flastCards).map((c) => `${c}`).join(' ').toString()}\nTotal - ${flastAmount}`
                }
            )
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(`Good Luck!`, guild.iconURL({ dynamic: true }));

        const optionsComponent = new MessageActionRow().addComponents(
            [
                new MessageButton()
                    .setLabel("Hit")
                    .setStyle("PRIMARY")
                    .setCustomId(`hit-bj-${user.id}`),
                new MessageButton()
                    .setLabel("Stand")
                    .setStyle("PRIMARY")
                    .setCustomId(`stand-bj-${user.id}`),
                new MessageButton()
                    .setLabel("Forfeit")
                    .setStyle("PRIMARY")
                    .setCustomId(`forfeit-bj-${user.id}`)
            ]
        );

        const msgI = await interaction.followUp({ embeds: [blackjackEmbed], components: [optionsComponent] });

        client.on('interactionCreate', async (int) => {
            if (!int.guild || !int.user || int.user.bot) return;

            await int.deferReply({ ephemeral: false }).catch((err) => null);

            if (int.isButton()) {
                if (int.customId == `hit-bj-${user.id}`) {
                    await int.followUp({ content: 'Blackjack Game ^^^^^' }).then((msg) => msg.delete().catch((err) => null));
                    let hitAmount;
                    const check = int.message.embeds[0].fields[0].value.split('-')[1].replace(/♦️/gim, "").trim().substring(0, 1)?.toLowerCase();
                    const flastEnumedNum = Math.floor(Math.random() * 9) + 1;


                    if (check == "k") hitAmount = 5;
                    if (check == "j") hitAmount = 5;
                    if (check == "l") hitAmount = 5;
                    if (check == "a") hitAmount = 10;
                    if (check == "b") hitAmount = 10;
                    if (check == "3") hitAmount = 3;
                    if (check == "5") hitAmount = 5;
                    if (check == "7") hitAmount = 7;
                    if (check == "4") hitAmount = 4;
                    if (check == "2") hitAmount = 2;

                    // const check1 = await userCards.findIndex((a) => a.replace(/♦️/gim, "").trim()?.toLowerCase() == check);

                    // if (check1?.toString() == "-1") return interaction.followUp({ content: `${user}, An internal error has happened, this rarely occurs but please try again!` });

                    await userCards.shift()
                    
                    const totalScore = startingAmount + hitAmount;

                    const flastTotal = flastAmount + flastEnumedNum;

                    if (totalScore > 21) {
                        msgI.edit({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                    .setDescription(`${user}, You got over 21 and lost! You have lost F$${amount?.toLocaleString()} in return.`)
                                    .addFields(
                                        {
                                            name: `${user.username} (Player)`,
                                            value: `Cards - ${(userCards).map((c) => `${c}`).join(' ').toString()}\nTotal - ${totalScore}\n\nK, J, L = 5; A, B = 10;`
                                        },
                                        {
                                            name: `${client.user.username} (Dealer)`,
                                            value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastTotal}`
                                        }
                                    )
                                    .setColor("RED")
                                    .setTimestamp()
                                    .setFooter(`Thank you for playing Blackjack`, guild.iconURL({ dynamic: true }))
                            ],
                            components: [
                                new MessageActionRow().addComponents(
                                    [
                                        new MessageButton()
                    .setLabel("Hit")
                    .setStyle("PRIMARY")
                    .setCustomId(`lost-1-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Stand")
                    .setStyle("PRIMARY")
                    .setCustomId(`lost-2-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Forfeit")
                    .setStyle("PRIMARY")
                    .setCustomId(`lost-3-lol`)
                    .setDisabled(true)
                                    ]
                                )
                            ]
                        });

                        await UserDB.updateOne({
                            UserID: user.id,
                            Wallet: UserDB.Wallet - amount,
                            Bank: UserDB.Bank
                        });
                        return;
                    };

                    if (flastTotal > 21) {
                        await flastCards.shift()

                        msgI.edit({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                .setDescription(`${user}, You won since the dealer's got over 21 and lost! You have gotten F$${amount?.toLocaleString()} in return.`)
                                .addFields(
                                    {
                                        name: `${user.username} (Player)`,
                                        value: `Cards - ${(userCards).map((c) => `${c}`).join(' ').toString()}\nTotal - ${totalScore}\n\nK, J, L = 5; A, B = 10;`
                                    },
                                    {
                                        name: `${client.user.username} (Dealer)`,
                                        value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastTotal}`
                                    }
                                )
                                .setColor("GREEN")
                                .setTimestamp()
                                .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                        ],
                        components: [
                            new MessageActionRow().addComponents(
                                [
                                    new MessageButton()
                .setLabel("Hit")
                .setStyle("PRIMARY")
                .setCustomId(`won-1-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Stand")
                .setStyle("PRIMARY")
                .setCustomId(`won-2-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Forfeit")
                .setStyle("PRIMARY")
                .setCustomId(`won-3-lol`)
                .setDisabled(true)
                                ]
                            )
                        ]
                    });

                    await UserDB.updateOne({
                        UserID: user.id,
                        Wallet: UserDB.Wallet + amount,
                        Bank: UserDB.Bank
                    });
                    return;
                    };

                    if (totalScore === 21) {
                        msgI.edit({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                    .setDescription(`${user}, You won since your score (\`${totalScore}\`) reached 21 first than the dealer's score (\`${flastTotal}\`)! In return you got F$${amount?.toLocaleString()}`)
                                    .addFields(
                                        {
                                            name: `${user.username} (Player)`,
                                            value: `Cards - ${(userCards).map((c) => `${c}`).join(' ').toString()}\nTotal - ${totalScore}\n\nK, J, L = 5; A, B = 10;`
                                        },
                                        {
                                            name: `${client.user.username} (Dealer)`,
                                            value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastTotal}`
                                        }
                                    )
                                    .setColor("GREEN")
                                    .setTimestamp()
                                    .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                            ],
                            components: [
                                new MessageActionRow().addComponents(
                                    [
                                        new MessageButton()
                    .setLabel("Hit")
                    .setStyle("PRIMARY")
                    .setCustomId(`won-1-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Stand")
                    .setStyle("PRIMARY")
                    .setCustomId(`won-2-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Forfeit")
                    .setStyle("PRIMARY")
                    .setCustomId(`won-3-lol`)
                    .setDisabled(true)
                                    ]
                                )
                            ]
                        });
    
                        await UserDB.updateOne({
                            UserID: user.id,
                            Wallet: UserDB.Wallet + amount,
                            Bank: UserDB.Bank
                        });
                        return;
                    };

                    if (flastTotal === 21) {
                        await flastCards.shift();

                        msgI.edit({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                    .setDescription(`${user}, You lost since the dealer's score (\`${flastTotal}\`) reached 21 first! In return you lost F$${amount?.toLocaleString()}`)
                                    .addFields(
                                        {
                                            name: `${user.username} (Player)`,
                                            value: `Cards - ${(userCards).map((c) => `${c}`).join(' ').toString()}\nTotal - ${totalScore}\n\nK, J, L = 5; A, B = 10;`
                                        },
                                        {
                                            name: `${client.user.username} (Dealer)`,
                                            value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastTotal}`
                                        }
                                    )
                                    .setColor("RED")
                                    .setTimestamp()
                                    .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                            ],
                            components: [
                                new MessageActionRow().addComponents(
                                    [
                                        new MessageButton()
                    .setLabel("Hit")
                    .setStyle("PRIMARY")
                    .setCustomId(`won-1-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Stand")
                    .setStyle("PRIMARY")
                    .setCustomId(`won-2-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Forfeit")
                    .setStyle("PRIMARY")
                    .setCustomId(`won-3-lol`)
                    .setDisabled(true)
                                    ]
                                )
                            ]
                        });
    
                        await UserDB.updateOne({
                            UserID: user.id,
                            Wallet: UserDB.Wallet - amount,
                            Bank: UserDB.Bank
                        });
                        return;
                    }

                    if (totalScore > flastTotal) {
                        await flastCards.shift();

                        msgI.edit({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                    .setDescription(`${user}, You won since your score (\`${totalScore}\`) stood higher than the dealer's score (\`${flastTotal}\`), In return you got F$${amount?.toLocaleString()}`)
                                    .addFields(
                                        {
                                            name: `${user.username} (Player)`,
                                            value: `Cards - ${(userCards).map((c) => `${c}`).join(' ').toString()}\nTotal - ${totalScore}\n\nK, J, L = 5; A, B = 10;`
                                        },
                                        {
                                            name: `${client.user.username} (Dealer)`,
                                            value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastTotal}`
                                        }
                                    )
                                    .setColor("GREEN")
                                    .setTimestamp()
                                    .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                            ],
                            components: [
                                new MessageActionRow().addComponents(
                                    [
                                        new MessageButton()
                    .setLabel("Hit")
                    .setStyle("PRIMARY")
                    .setCustomId(`won-1-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Stand")
                    .setStyle("PRIMARY")
                    .setCustomId(`won-2-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Forfeit")
                    .setStyle("PRIMARY")
                    .setCustomId(`won-3-lol`)
                    .setDisabled(true)
                                    ]
                                )
                            ]
                        });
    
                        await UserDB.updateOne({
                            UserID: user.id,
                            Wallet: UserDB.Wallet + amount,
                            Bank: UserDB.Bank
                        });
                        return;
                    };

                    if (flastTotal > totalScore) {
                        await flastCards.shift();

                        msgI.edit({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                    .setDescription(`${user}, You lost since your score (\`${totalScore}\`) stood lower than the dealer's score (\`${flastTotal}\`), In return you lost F$${amount?.toLocaleString()}`)
                                    .addFields(
                                        {
                                            name: `${user.username} (Player)`,
                                            value: `Cards - ${(userCards).map((c) => `${c}`).join(' ').toString()}\nTotal - ${totalScore}\n\nK, J, L = 5; A, B = 10;`
                                        },
                                        {
                                            name: `${client.user.username} (Dealer)`,
                                            value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastTotal}`
                                        }
                                    )
                                    .setColor("RED")
                                    .setTimestamp()
                                    .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                            ],
                            components: [
                                new MessageActionRow().addComponents(
                                    [
                                        new MessageButton()
                    .setLabel("Hit")
                    .setStyle("PRIMARY")
                    .setCustomId(`lost-1-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Stand")
                    .setStyle("PRIMARY")
                    .setCustomId(`lost-2-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Forfeit")
                    .setStyle("PRIMARY")
                    .setCustomId(`lost-3-lol`)
                    .setDisabled(true)
                                    ]
                                )
                            ]
                        });
    
                        await UserDB.updateOne({
                            UserID: user.id,
                            Wallet: UserDB.Wallet - amount,
                            Bank: UserDB.Bank
                        });
                        return;
                    };

                    if (totalScore === flastTotal) {
                        await flastCards.shift();

                        msgI.edit({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                    .setDescription(`${user}, You tied with the dealer since your score (\`${totalScore}\`) is the same with the dealer's score (\`${flastTotal}\`), Therefore you got nothing in return.`)
                                    .addFields(
                                        {
                                            name: `${user.username} (Player)`,
                                            value: `Cards - ${(userCards).map((c) => `${c}`).join(' ').toString()}\nTotal - ${totalScore}\n\nK, J, L = 5; A, B = 10;`
                                        },
                                        {
                                            name: `${client.user.username} (Dealer)`,
                                            value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastTotal}`
                                        }
                                    )
                                    .setColor("AQUA")
                                    .setTimestamp()
                                    .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                            ],
                            components: [
                                new MessageActionRow().addComponents(
                                    [
                                        new MessageButton()
                    .setLabel("Hit")
                    .setStyle("PRIMARY")
                    .setCustomId(`tie-1-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Stand")
                    .setStyle("PRIMARY")
                    .setCustomId(`tie-2-lol`)
                    .setDisabled(true),
                new MessageButton()
                    .setLabel("Forfeit")
                    .setStyle("PRIMARY")
                    .setCustomId(`tie-3-lol`)
                    .setDisabled(true)
                                    ]
                                )
                            ]
                        });
                        return;
                    };
                };
                if (int.customId == `forfeit-bj-${user.id}`) {
                    await int.followUp({ content: `Blackjack Game ^^^` }).then((msg) => msg.delete().catch((err) => null));

                    const youForfeitted = new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Blackjack`, guild.iconURL({ dynamic: true }))
                    .setDescription(`${user}, You have ended the Blackjack game in return the dealer kept your money you bullcrap.`)
                    .addFields(
                        {
                            name: int.message.embeds[0].fields[0].name,
                            value: int.message.embeds[0].fields[0].value
                        },
                        {
                            name: int.message.embeds[0].fields[1].name,
                            value: int.message.embeds[0].fields[1].value
                        }
                    )
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                    return msgI.edit({
                        embeds: [youForfeitted],
                        components: [
                            new MessageActionRow().addComponents(
                                [
                                    new MessageButton()
                .setLabel("Hit")
                .setStyle("PRIMARY")
                .setCustomId(`forfeit-1-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Stand")
                .setStyle("PRIMARY")
                .setCustomId(`forfeit-2-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Forfeit")
                .setStyle("PRIMARY")
                .setCustomId(`forfeit-3-lol`)
                .setDisabled(true)
                                ]
                            )
                        ]
                    });
                };

                if (int.customId == `stand-bj-${user.id}`) {
                    await int.followUp({ content: "Blackjack Game ^^^" }).then((msg) => msg.delete().catch((err) => null));

                    const flastRand = Math.floor(Math.random() * 9) + 1;

                    const flastTotalScore = flastAmount + flastRand;

                    if (flastTotalScore > 21) {
                        await flastCards.shift();

                        msgI.edit({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                .setDescription(`${user}, You won since the dealer's score got over 21 and lost! You have gotten F$${amount?.toLocaleString()} in return.`)
                                .addFields(
                                    {
                                        name: int.message.embeds[0].fields[0].name,
                                        value: int.message.embeds[0].fields[0].value
                                    },
                                    {
                                        name: int.message.embeds[0].fields[1].name,
                                        value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastAmount + flastRand}`
                                    }
                                )
                                .setColor("GREEN")
                                .setTimestamp()
                                .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                        ],
                        components: [
                            new MessageActionRow().addComponents(
                                [
                                    new MessageButton()
                .setLabel("Hit")
                .setStyle("PRIMARY")
                .setCustomId(`won-1-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Stand")
                .setStyle("PRIMARY")
                .setCustomId(`won-2-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Forfeit")
                .setStyle("PRIMARY")
                .setCustomId(`won-3-lol`)
                .setDisabled(true)
                                ]
                            )
                        ]
                    });

                    await UserDB.updateOne({
                        UserID: user.id,
                        Wallet: UserDB.Wallet + amount,
                        Bank: UserDB.Bank
                    });
                    return;
                    };

                    if (flastTotalScore === 21) {
                        await flastCards.shift()

                        msgI.edit({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                .setDescription(`${user}, You lost since the dealer's got to 21 first! You have lost F$${amount?.toLocaleString()} in return.`)
                                .addFields(
                                    {
                                        name: int.message.embeds[0].fields[0].name,
                                        value: int.message.embeds[0].fields[0].value
                                    },
                                    {
                                        name: int.message.embeds[0].fields[1].name,
                                        value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastAmount + flastRand}`
                                    }
                                )
                                .setColor("RED")
                                .setTimestamp()
                                .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                        ],
                        components: [
                            new MessageActionRow().addComponents(
                                [
                                    new MessageButton()
                .setLabel("Hit")
                .setStyle("PRIMARY")
                .setCustomId(`lost-1-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Stand")
                .setStyle("PRIMARY")
                .setCustomId(`lost-2-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Forfeit")
                .setStyle("PRIMARY")
                .setCustomId(`lost-3-lol`)
                .setDisabled(true)
                                ]
                            )
                        ]
                    });

                    await UserDB.updateOne({
                        UserID: user.id,
                        Wallet: UserDB.Wallet - amount,
                        Bank: UserDB.Bank
                    });
                    return;
                    };

                    if (flastTotalScore > startingAmount) {
                        await flastCards.shift()

                        msgI.edit({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                .setDescription(`${user}, You lost since the dealer's score (\`${flastTotalScore}\`) stood higher than your score (\`${startingAmount}\`), In return you lost F$${amount?.toLocaleString()}`)
                                .addFields(
                                    {
                                        name: int.message.embeds[0].fields[0].name,
                                        value: int.message.embeds[0].fields[0].value
                                    },
                                    {
                                        name: int.message.embeds[0].fields[1].name,
                                        value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastTotalScore}`
                                    }
                                )
                                .setColor("RED")
                                .setTimestamp()
                                .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                        ],
                        components: [
                            new MessageActionRow().addComponents(
                                [
                                    new MessageButton()
                .setLabel("Hit")
                .setStyle("PRIMARY")
                .setCustomId(`lost-1-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Stand")
                .setStyle("PRIMARY")
                .setCustomId(`lost-2-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Forfeit")
                .setStyle("PRIMARY")
                .setCustomId(`lost-3-lol`)
                .setDisabled(true)
                                ]
                            )
                        ]
                    });

                    await UserDB.updateOne({
                        UserID: user.id,
                        Wallet: UserDB.Wallet - amount,
                        Bank: UserDB.Bank
                    });
                    return;
                    };

                    if (startingAmount > flastTotalScore) {
                        await flastCards.shift()

                        msgI.edit({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`${guild.name} Server | ${user.username}'s Blackjack`, guild.iconURL({ dynamic: true }))
                                .setDescription(`${user}, You won since the dealer's score (\`${flastTotalScore}\`) stood lower than your score (\`${startingAmount}\`)! You have gotten F$${amount?.toLocaleString()} in return.`)
                                .addFields(
                                    {
                                        name: int.message.embeds[0].fields[0].name,
                                        value: int.message.embeds[0].fields[0].value
                                    },
                                    {
                                        name: int.message.embeds[0].fields[1].name,
                                        value: `Cards - ${(flastCards).map((c1) => `${c1}`).join(' ').toString()}\nTotal - ${flastTotalScore}`
                                    }
                                )
                                .setColor("GREEN")
                                .setTimestamp()
                                .setFooter(`Thank You for playing Blackjack!`, guild.iconURL({ dynamic: true }))
                        ],
                        components: [
                            new MessageActionRow().addComponents(
                                [
                                    new MessageButton()
                .setLabel("Hit")
                .setStyle("PRIMARY")
                .setCustomId(`won-1-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Stand")
                .setStyle("PRIMARY")
                .setCustomId(`won-2-lol`)
                .setDisabled(true),
            new MessageButton()
                .setLabel("Forfeit")
                .setStyle("PRIMARY")
                .setCustomId(`won-3-lol`)
                .setDisabled(true)
                                ]
                            )
                        ]
                    });

                    await UserDB.updateOne({
                        UserID: user.id,
                        Wallet: UserDB.Wallet + amount,
                        Bank: UserDB.Bank
                    });
                    return;
                    }
                }
            }
        });
    },
};