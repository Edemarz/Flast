const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require("../../models/WorkDB");
const EcoDB = require("../../models/EconomyDB");
const {
    MessageActionRow,
    MessageSelectMenu,
    MessageEmbed,
    Message,
    MessageButton,
} = require("discord.js");

const v = require("../../Functions/checkDisabled");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDefaultPermission(true)
        .setDescription("Work and get some Flast Dollars!"),
    category: "Economy",
    cooldown: 3600,
    usage: "/work",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const { member, user, guild } = interaction;

        const bP = await v(guild.id, "work");

        if (bP) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, The work command & system is disabled in this server, Please ask an admin to enable the command from the [Dashboard](${client.config.Dashboard.host}/) or from the command \`\`\`/enable-economy-command <Command>\`\`\``,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]})

        const workDB = await DB.findOne({
            UserID: user.id,
        });

        const FoundEcoDB = await EcoDB.findOne({
            UserID: user.id,
        });

        if (!workDB) {
            let dropdownArray = [];

            for (const jobObject of client.jobs) {
                dropdownArray.push({
                    label: jobObject.label,
                    value: jobObject.value,
                    description: `${jobObject.description
                        }\nSalary: F$1-${jobObject.salaryRange?.toLocaleString()}`,
                });
            }

            const GenDrop = new MessageSelectMenu()
                .addOptions(dropdownArray)
                .setCustomId("work-dropdown")
                .setMaxValues(1)
                .setMinValues(1);

            const comp = new MessageActionRow().addComponents([GenDrop]);

            const objEmbed = new MessageEmbed()
                .setDescription(
                    dropdownArray
                        .map((ao) => `\`${ao.label}\`\n- ${ao.description}`)
                        .join("\n")
                        .toString()
                )
                .setAuthor(`${guild.name} Server | Work`)
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .setColor("BLURPLE");

            return interaction.followUp({ components: [comp], embeds: [objEmbed] });
        }

        //Minigames

        const minigames = ["type-let", "color"];

        const minRand = Math.floor(Math.random() * minigames.length);

        const decidingMin = minigames[minRand];

        //Letters Minigame

        if (decidingMin === "type-let") {
            const letterToAdd = [
                "s1rsd-dsada45sd5sd97",
                "sd8ansdj-d789d8as7ds",
                "s8sdg-s8dgsabd",
                "a9shNS-s8sas14sd",
                "da98d-dsa4d6as4d",
                "s8samx8dssnsd-sads7db",
                "dasd456789-5das797",
            ];
            const randLet = Math.floor(Math.random() * letterToAdd.length);

            const sp1 = ["|", "/", "`", "@"];

            const ranSp1 = Math.floor(Math.random() * sp1.length);

            const sp2 = ["a", "l", "s", "k", "j"];

            const ranSp2 = Math.floor(Math.random() * sp2.length);

            const miniLet = [];
            const minLetCor = [];

            letterToAdd[randLet].split("").forEach((let) => {
                miniLet.push(`${let?.toUpperCase()}${sp1[ranSp1]}${sp2[ranSp2]}`);
                minLetCor.push(let?.toUpperCase());
            });

            const correctMinilet = minLetCor.join("").toString();

            const miniGame = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Work`)
                .setDescription(
                    `${user}, You are working as a ${workDB.Work.job
                    }.\nType the following words without the letters \`${sp1[ranSp1]}${sp2[ranSp2]
                    }\`\n\`\`\`\n${miniLet
                        .join("")
                        .toString()}\n\`\`\`\n\nYou have 45 seconds to type the words.`
                )
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }));

            interaction.followUp({ embeds: [miniGame] });

            const filter = (m) => m.author.id === user.id && !m.author.bot;

            const msgCollector = await interaction.channel.createMessageCollector({
                filter,
                time: 45000,
            });

            msgCollector.on("collect", (msg) => {
                if (
                    (msg.content?.toLowerCase() === correctMinilet?.toLowerCase()) ===
                    false
                )
                    msgCollector.stop("incorrect");
                if (
                    (msg.content?.toLowerCase() === correctMinilet?.toLowerCase()) ===
                    true
                )
                    msgCollector.stop("correct");
            });

            msgCollector.on("end", async (collected, reason) => {
                if (reason == "time") {
                    const ranOutOfTime = new MessageEmbed()
                        .setAuthor(`${guild.name} Server | Work`)
                        .setDescription(
                            `${user}, You ran out of time while working as a ${workDB.Work.job} and in return you got F$0.\nWork better next time!`
                        )
                        .setColor("RED")
                        .setTimestamp()
                        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                        .setThumbnail(guild.iconURL({ dynamic: true }));

                    return interaction.channel.send({ embeds: [ranOutOfTime] });
                }
                if (reason === "incorrect") {
                    const youAreIncorrect = new MessageEmbed()
                        .setAuthor(`${guild.name} Server | Work`)
                        .setDescription(
                            `${user}, You were incorrect and got nothing out of your work, The correct letters were:\n\`${correctMinilet}\`\nGet better at your job to get some cash!`
                        )
                        .setColor("RED")
                        .setTimestamp()
                        .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                    return interaction.followUp({ embeds: [youAreIncorrect] });
                }
                if (reason === "correct") {
                    const salaryRange = await Math.floor(
                        Math.random() * workDB.Work.salary
                    );

                    let deathRange;
                    let lostAmount;

                    if (workDB.Work.allowDeath)
                        deathRange = (await Math.floor(Math.random() * 1000)) + 1; //1-3% Chance to die at work!

                    if (FoundEcoDB) {
                        if (deathRange === 69) lostAmount = workDB.Work.salary;
                        if (lostAmount && lostAmount > FoundEcoDB.Wallet)
                            lostAmount = FoundEcoDB.Wallet;
                        if (deathRange === 69 && lostAmount) {
                            const sadlyDied = new MessageEmbed()
                                .setAuthor(
                                    `${guild.name} Server | Work`,
                                    guild.iconURL({ dynamic: true })
                                )
                                .setThumbnail(guild.iconURL({ dynamic: true }))
                                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                                .setColor("BLURPLE")
                                .setTimestamp()
                                .setDescription(
                                    `${user}, Sadly you have died and lost F$${lostAmount?.toLocaleString()} while doing your job as a ${workDB.Work.job
                                    }, and you sadly got fired...`
                                );

                            await workDB.deleteOne();
                            await FoundEcoDB.updateOne({
                                UserID: user.id,
                                Wallet: FoundEcoDB.Wallet - lostAmount,
                                Bank: FoundEcoDB.Bank,
                            });

                            return interaction.channel.send({ embeds: [sadlyDied] });
                        }

                        await FoundEcoDB.updateOne({
                            UserID: user.id,
                            Wallet: FoundEcoDB.Wallet + salaryRange,
                            Bank: FoundEcoDB.Bank,
                        });

                        const workedWoooo = new MessageEmbed()
                            .setAuthor(
                                `${guild.name} Server | Work`,
                                guild.iconURL({ dynamic: true })
                            )
                            .setThumbnail(guild.iconURL({ dynamic: true }))
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                            .setColor("BLURPLE")
                            .setTimestamp()
                            .setDescription(
                                `${user}, You have worked as a ${workDB.Work.job
                                } and got the letters correctly! In return you got F$${salaryRange?.toLocaleString()}, Come back in an hour to work again!`
                            );

                        return interaction.channel.send({ embeds: [workedWoooo] });
                    }

                    if (!FoundEcoDB) {
                        if (deathRange === 69) lostAmount = workDB.Work.salary;
                        if (lostAmount && lostAmount > FoundEcoDB.Wallet)
                            lostAmount = FoundEcoDB.Wallet;
                        if (deathRange === 69 && lostAmount) {
                            const sadlyDied = new MessageEmbed()
                                .setAuthor(
                                    `${guild.name} Server | Work`,
                                    guild.iconURL({ dynamic: true })
                                )
                                .setThumbnail(guild.iconURL({ dynamic: true }))
                                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                                .setColor("BLURPLE")
                                .setTimestamp()
                                .setDescription(
                                    `${user}, Sadly you have died with no apparent causes and lost F$${lostAmount?.toLocaleString()} while doing your job as a ${workDB.Work.job
                                    }, and you sadly got fired...`
                                );

                            await workDB.deleteOne();

                            return interaction.channel.send({ embeds: [sadlyDied] });
                        }

                        await new EcoDB({
                            UserID: user.id,
                            Wallet: salaryRange,
                            Bank: 0,
                        }).save();

                        const workedWoooo = new MessageEmbed()
                            .setAuthor(
                                `${guild.name} Server | Work`,
                                guild.iconURL({ dynamic: true })
                            )
                            .setThumbnail(guild.iconURL({ dynamic: true }))
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                            .setColor("BLURPLE")
                            .setTimestamp()
                            .setDescription(
                                `${user}, You have worked as a ${workDB.Work.job
                                } and got the letters correctly! In return you get F$${salaryRange?.toLocaleString()}, Come back in an hour to work again!`
                            );

                        return interaction.channel.send({ embeds: [workedWoooo] });
                    }
                }
            });
        }

        //Colors Game

        if (decidingMin === "color") {
            const color1 = ["🟦-Blue", "⬛-Black"];
            const color2 = ["🟧-Orange", "🟪-Purple"];
            const color3 = ["🟫-Brown", "🟩-Green"];

            const color1Rand = Math.floor(Math.random() * color1.length);
            const color2Rand = Math.floor(Math.random() * color2.length);
            const color3Rand = Math.floor(Math.random() * color3.length);

            const colorWords1 = ["Pen", "Eraser", "Book", "Backpack"];
            const colorWords2 = ["Workbook", "Glue", "Paper", "Buffalo"];
            const colorWords3 = ["Bag", "Pencil", "Cash", "Ruler"];

            const colorWords1Rand = Math.floor(Math.random() * colorWords1.length);
            const colorWords2Rand = Math.floor(Math.random() * colorWords2.length);
            const colorWords3Rand = Math.floor(Math.random() * colorWords3.length);

            const winningGameData = [
                `${color1[color1Rand]} - ${colorWords1[colorWords1Rand]}`,
                `${color2[color2Rand]} - ${colorWords2[colorWords2Rand]}`,
                `${color3[color3Rand]} - ${colorWords3[colorWords3Rand]}`,
            ];

            const compGameData = [
                `${color1[color1Rand].split("-")[0]} - ${colorWords1[colorWords1Rand]}`,
                `${color2[color2Rand].split("-")[0]} - ${colorWords2[colorWords2Rand]}`,
                `${color3[color3Rand].split("-")[0]} - ${colorWords3[colorWords3Rand]}`,
            ];

            const GameEmbed = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Work`)
                .setDescription(
                    `${user}, Memorize these colors:\n\n${compGameData
                        .map((game) => `${game}`)
                        .join("\n\n")
                        .toString()}\n\nYou have 10 seconds!`
                )
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }));

            const gameMessage = await interaction
                .followUp({ embeds: [GameEmbed] })
                .then((msg) =>
                    setTimeout(() => {
                        const randData = Math.floor(Math.random() * winningGameData.length);
                        const gameColorNow = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Work`)
                            .setDescription(
                                `${user}, What color were next to ${winningGameData[randData]
                                    .split("-")[2]
                                    .trim()}?\n\nYou have 10 seconds to answer!`
                            )
                            .setColor("GREEN")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                            .setThumbnail(guild.iconURL({ dynamic: true }));

                        const firstBtn = new MessageButton()
                            .setCustomId(winningGameData[0].split("-")[1].trim())
                            .setLabel(winningGameData[0].split("-")[1].trim())
                            .setStyle("SECONDARY");

                        const secondBtn = new MessageButton()
                            .setCustomId(winningGameData[1].split("-")[1].trim())
                            .setLabel(winningGameData[1].split("-")[1].trim())
                            .setStyle("SECONDARY");

                        const thirdBtn = new MessageButton()
                            .setCustomId(winningGameData[2].split("-")[1].trim())
                            .setLabel(winningGameData[2].split("-")[1].trim())
                            .setStyle("SECONDARY");

                        const allButtons = new MessageActionRow().addComponents([
                            firstBtn,
                            secondBtn,
                            thirdBtn,
                        ]);

                        msg.edit({ embeds: [gameColorNow], components: [allButtons] });

                        client.on("interactionCreate", async (int) => {
                            if (
                                !int.guild ||
                                !int.channel ||
                                int.user.bot
                            )
                                return;


                            if (!int || !int.message || !int.message.id === msg.id) return;

                            const { user, member, guild, channel } = int;

                            //I was debugging here

                            if (int.isButton()) {
                                if (int.user.id !== interaction.user.id) return int.reply({ content: `${int.user}, This is not your work time, go away`, ephemeral: true });
                                await int
                                    .deferReply({ ephemeral: false })
                                    .catch(() => null);

                                if (
                                    int.customId ===
                                    winningGameData[randData].split("-")[1].trim()
                                ) {
                                    const gameColorNow = new MessageEmbed()
                                        .setAuthor(`${guild.name} Server | Work`)
                                        .setDescription(
                                            `${user}, What color were next to ${winningGameData[
                                                randData
                                            ]
                                                .split("-")[2]
                                                .trim()}?\n\nYou have 10 seconds to answer!`
                                        )
                                        .setColor("GREEN")
                                        .setTimestamp()
                                        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                                        .setThumbnail(guild.iconURL({ dynamic: true }));

                                    const theComp = await winningGameData.findIndex((data) => data.split('-')[1].trim() === int.component.customId);

                                    if (theComp?.toString() == "-1") return int.channel.send({
                                        embeds: [
                                            client.createEmbed({
                                                text: `${user}, An Internal Error has happened, Please try again!`,
                                                color: "RED",
                                                footerOne: guild.name,
                                                footerTwo: guild.iconURL({ dynamic: true }),
                                                thumbnail: guild.iconURL({ dynamic: true })
                                            })
                                        ]
                                    });

                                    let completeData = [];

                                    const disButton1 = new MessageButton()
                                        .setLabel(winningGameData[theComp].split('-')[1].trim())
                                        .setCustomId("you-won-1")
                                        .setDisabled(true)
                                        .setStyle("SUCCESS");

                                    if (theComp?.toString() == "0") {
                                        await winningGameData.slice(theComp, theComp + 1)
                                    };

                                    if (theComp >= 1) {
                                        await winningGameData.slice(theComp, theComp + 1)
                                    };

                                    for (const compGameData of winningGameData) {
                                        completeData.push(compGameData)
                                    };

                                    const disButton2 = new MessageButton()
                                        .setLabel(completeData[0].split('-')[1].trim())
                                        .setCustomId("you-won-2")
                                        .setDisabled(true)
                                        .setStyle("SECONDARY");

                                    const disButton3 = new MessageButton()
                                        .setLabel(completeData[1].split('-')[1].trim())
                                        .setCustomId("you-won-3")
                                        .setDisabled(true)
                                        .setStyle("SECONDARY");

                                    const allCompBtns = new MessageActionRow().addComponents([disButton1, disButton2, disButton3]);

                                    msg.edit({ embeds: [gameColorNow], components: [allCompBtns] });

                                    const salaryRange = await Math.floor(
                                        Math.random() * workDB.Work.salary
                                    );

                                    let deathRange;
                                    let lostAmount;

                                    if (workDB.Work.allowDeath)
                                        deathRange = (await Math.floor(Math.random() * 1000)) + 1; //1-3% Chance to die at work!

                                    if (FoundEcoDB) {
                                        if (deathRange === 69) lostAmount = workDB.Work.salary;
                                        if (lostAmount && lostAmount > FoundEcoDB.Wallet)
                                            lostAmount = FoundEcoDB.Wallet;
                                        if (deathRange === 69 && lostAmount) {
                                            const sadlyDied = new MessageEmbed()
                                                .setAuthor(
                                                    `${guild.name} Server | Work`,
                                                    guild.iconURL({ dynamic: true })
                                                )
                                                .setThumbnail(guild.iconURL({ dynamic: true }))
                                                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                                                .setColor("BLURPLE")
                                                .setTimestamp()
                                                .setDescription(
                                                    `${user}, Sadly you have died and lost F$${lostAmount?.toLocaleString()} while doing your job as a ${workDB.Work.job
                                                    }, and you sadly got fired...`
                                                );

                                            await workDB.deleteOne();
                                            await FoundEcoDB.updateOne({
                                                UserID: user.id,
                                                Wallet: FoundEcoDB.Wallet - lostAmount,
                                                Bank: FoundEcoDB.Bank,
                                            });

                                            return int.followUp({ embeds: [sadlyDied] });
                                        }

                                        await FoundEcoDB.updateOne({
                                            UserID: user.id,
                                            Wallet: FoundEcoDB.Wallet + salaryRange,
                                            Bank: FoundEcoDB.Bank,
                                        });

                                        const workedWoooo = new MessageEmbed()
                                            .setAuthor(
                                                `${guild.name} Server | Work`,
                                                guild.iconURL({ dynamic: true })
                                            )
                                            .setThumbnail(guild.iconURL({ dynamic: true }))
                                            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                                            .setColor("BLURPLE")
                                            .setTimestamp()
                                            .setDescription(
                                                `${user}, You have worked as a ${workDB.Work.job
                                                } and got the colors correctly! In return you got F$${salaryRange?.toLocaleString()}, Come back in an hour to work again!`
                                            );

                                        return int.followUp({ embeds: [workedWoooo] });
                                    }

                                    if (!FoundEcoDB) {
                                        if (deathRange === 69) lostAmount = workDB.Work.salary;
                                        if (lostAmount && lostAmount > FoundEcoDB.Wallet)
                                            lostAmount = FoundEcoDB.Wallet;
                                        if (deathRange === 69 && lostAmount) {
                                            const sadlyDied = new MessageEmbed()
                                                .setAuthor(
                                                    `${guild.name} Server | Work`,
                                                    guild.iconURL({ dynamic: true })
                                                )
                                                .setThumbnail(guild.iconURL({ dynamic: true }))
                                                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                                                .setColor("BLURPLE")
                                                .setTimestamp()
                                                .setDescription(
                                                    `${user}, Sadly you have died with no apparent causes and lost F$${lostAmount?.toLocaleString()} while doing your job as a ${workDB.Work.job
                                                    }, and you sadly got fired...`
                                                );

                                            await workDB.deleteOne();

                                            return int.followUp({ embeds: [sadlyDied] });
                                        }

                                        await new EcoDB({
                                            UserID: user.id,
                                            Wallet: salaryRange,
                                            Bank: 0,
                                        }).save();

                                        const workedWoooo = new MessageEmbed()
                                            .setAuthor(
                                                `${guild.name} Server | Work`,
                                                guild.iconURL({ dynamic: true })
                                            )
                                            .setThumbnail(guild.iconURL({ dynamic: true }))
                                            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                                            .setColor("BLURPLE")
                                            .setTimestamp()
                                            .setDescription(
                                                `${user}, You have worked as a ${workDB.Work.job
                                                } and got the colors correctly! In return you get F$${salaryRange?.toLocaleString()}, Come back in an hour to work again!`
                                            );

                                        return int.followUp({ embeds: [workedWoooo] });
                                    }
                                } else {
                                    const gameColorNow = new MessageEmbed()
                                        .setAuthor(`${guild.name} Server | Work`)
                                        .setDescription(
                                            `${user}, What color were next to ${winningGameData[
                                                randData
                                            ]
                                                .split("-")[2]
                                                .trim()}?\n\nYou have 10 seconds to answer!`
                                        )
                                        .setColor("GREEN")
                                        .setTimestamp()
                                        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                                        .setThumbnail(guild.iconURL({ dynamic: true }));

                                    const clickedComponent = int.component;

                                    const compIndex = await winningGameData.findIndex((data) => data.split('-')[1].trim() === clickedComponent.customId); //:Blue_Square:-:ID: - :Object Name:

                                    console.log(compIndex)

                                    if (compIndex?.toString() == "-1") return int.followUp({ embeds: [
                                        client.createEmbed({
                                            text: `${user}, An Internal Error has happened, Please try again!`,
                                            color: "RED",
                                            footerOne: guild.name,
                                            footerTwo: guild.iconURL({ dynamic: true }),
                                            thumbnail: guild.iconURL({ dynamic: true })
                                        })
                                    ]});

                                    const unclickedButtons = [];

                                    const disWrongBtn = new MessageButton()
                                    .setLabel(winningGameData[compIndex].split('-')[1].trim())
                                    .setCustomId("you-lost-1")
                                    .setStyle("DANGER")
                                    .setDisabled(true)

                                    if (compIndex?.toString() == "0") {
                                        await winningGameData.slice(compIndex, compIndex + 1); //Remove the wrong button value from the  array
                                    };

                                    if (compIndex >= 1) {
                                        await winningGameData.slice(compIndex, compIndex); //Remove the wrong button value from the  array
                                    };

                                    for (const gameData of winningGameData) {
                                        unclickedButtons.push(gameData); //Guaranteed to have 2 values in unclickedButtons
                                    };  
                                    
                                    const btn1 = new MessageButton()
                                    .setLabel(winningGameData[0].split('-')[1].trim())
                                    .setStyle("SECONDARY")
                                    .setCustomId("you-lost-2")
                                    .setDisabled(true)

                                    const btn2 = new MessageButton()
                                    .setLabel(winningGameData[1].split('-')[1].trim())
                                    .setCustomId("you-lost-3")
                                    .setDisabled(true)
                                    .setStyle("SECONDARY");

                                    const allBtnsClicked = new MessageActionRow().addComponents([disWrongBtn, btn1, btn2]);

                                    msg.edit({ embeds: [gameColorNow], components: [allBtnsClicked] });

                                    const youWereWrong = new MessageEmbed()
                                    .setAuthor(`${guild.name} Server | Work`)
                                    .setDescription(`${user}, You have gotten the colors wrongly and got F$0!`)
                                    .setColor("RED")
                                    .setTimestamp()
                                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))

                                    int.followUp({ embeds: [youWereWrong] });
                                }
                            }
                        });
                    }, 10000)
                );
        };
    },
};
//647 Lines!