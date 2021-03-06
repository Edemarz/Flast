//Importing & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const InvDB = require("../../models/Inventory");
const { MessageEmbed, MessageButton, MessageActionRow, User } = require("discord.js");
const DB = require("../../models/EconomyDB");
const EconomyShopList = require("../../EconomyData");
const ActiveEffects = require("../../models/ActiveEffects");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
        .setName("use")
        .setDefaultPermission(true)
        .setDescription("Use an item in your inventory to do stuff!")
        .addStringOption((option) => option.setName("item").setDescription("The item to use!").setRequired(true)),
    category: "Economy",
    usage: "/use <Item>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Creating a sleep function!
        function sleep(int) {
            return new Promise((resolve) => setTimeout(() => resolve(), int * 1000))
        };
        //Destructuring Interaction
        const { member, user, guild, options } = interaction;

        //Command System
        const item = options.getString("item")?.toLowerCase();

        const UserInv = await InvDB.findOne({
            UserID: user.id
        });

        const UserDB = await DB.findOne({
            UserID: user.id
        });

        if (!UserInv) return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                    .setDescription(`${user}, You do not have anything in your inventory!`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            ]
        });

        const useableItems = []; //Guaranteed to have 1 Element!

        let included;

        for (const item of EconomyShopList.Shop) {
            if (item.useable) useableItems.push(item);
        };

        await useableItems.forEach((i) => {
            if (i.name?.toLowerCase() == item) included = true
        });

        let youHaveTheItem;

        if (!included) return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                    .setDescription(`${user}, The item **${item}** is not useable!`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            ]
        });

        for (const item1 of UserInv.Inventory) {
            if (item1.item?.toLowerCase()?.trim() === item?.toLowerCase()?.trim()) youHaveTheItem = true
        }

        if (!youHaveTheItem) return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Use`)
                    .setDescription(`${user}, You do not have the item **${item}** in your inventory!`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            ]
        });

        if (item == "laptop") {
            const options = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Use`)
                .setDescription(`${user}, Pick the following:\nP - Post Meme\nRTD - Ring the Developer\n\nYou have 25 seconds to answer!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))

            interaction.followUp({ embeds: [options] });

            const filter = m => m.author.id === user.id && !m.author.bot;

            const msgColl = await interaction.channel.createMessageCollector({ filter, time: 25000 });

            msgColl.on('collect', async (message) => {
                if (!["p", "rtd"].includes(message.content?.toLowerCase())) interaction.followUp({
                    embeds: [
                        client.createEmbed({
                            text: `${user}, The option **${message.content}** is not a valid option!`,
                            color: "RED",
                            footerOne: guild.name,
                            footerTwo: guild.iconURL({ dynamic: true }),
                            thumbnail: guild.iconURL({ dynamic: true })
                        })
                    ]
                });

                if (message.content?.toLowerCase() == "p") return msgColl.stop("meme");
                if (message.content?.toLowerCase() == "rtd") return msgColl.stop("call")
            });

            msgColl.on('end', (collected, reason) => {
                if (reason == "time") return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Use`)
                            .setDescription(`${user}, You ran out of time, Please try again!`)
                            .setColor("RED")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                    ]
                });

                if (reason == "meme") {
                    const likeReviews = Math.floor(Math.random() * 1000);
                    const hateReviews = Math.floor(Math.random() * 1000);

                    const options = ["Reddit", "Google", "YouTube", "TikTok"];

                    const randOptions = Math.floor(Math.random() * options.length);

                    const embed = new MessageEmbed()
                        .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                        .setDescription(`${user}, You have posted a meme on ${options[randOptions]}.\nPlease wait for reviews.`)
                        .setColor("BLUE")
                        .setTimestamp()
                        .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                    interaction.followUp({ embeds: [embed] }).then(async (msg) => {
                        await sleep(1.5);
                        const embed1 = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have posted a meme on ${options[randOptions]}.\nPlease wait for reviews..`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                        await msg.edit({ embeds: [embed1] });
                        await sleep(1.5);
                        const embed2 = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have posted a meme on ${options[randOptions]}.\nPlease wait for reviews...`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                        await msg.edit({ embeds: [embed2] });
                        await sleep(1.5);
                        const embed3 = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have posted a meme on ${options[randOptions]}.\nPlease wait for reviews.`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                        await msg.edit({ embeds: [embed3] });
                        await sleep(1.5);
                        const embed4 = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have posted a meme on ${options[randOptions]}.\nPlease wait for reviews..`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                        await msg.edit({ embeds: [embed4] });
                        await sleep(1.5);
                        const embed5 = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have posted a meme on ${options[randOptions]}.\nPlease wait for reviews...`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                        await msg.edit({ embeds: [embed5] });
                        await sleep(1.5);
                        const embed6 = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have posted a meme on ${options[randOptions]}.\nPlease wait for reviews.`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                        await msg.edit({ embeds: [embed6] });
                        await sleep(1.5);
                        const embed7 = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have posted a meme on ${options[randOptions]}.\nPlease wait for reviews..`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                        await msg.edit({ embeds: [embed7] });
                        await sleep(1.5);
                        const embed8 = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have posted a meme on ${options[randOptions]}.\nPlease wait for reviews...`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                        await msg.edit({ embeds: [embed8] });
                        await sleep(1.5);

                        if (likeReviews > hateReviews) {
                            const aM = Math.floor(Math.random() * 50000) + 1;

                            const theyLikeIt = new MessageEmbed()
                                .setAuthor(`${guild.name} Server | Use`)
                                .setDescription(`${user}, Apparently they like your meme posted on ${options[randOptions]}, In return you got F$${aM?.toLocaleString()}!`)
                                .setColor("BLURPLE")
                                .setTimestamp()
                                .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                            interaction.followUp({ embeds: [theyLikeIt] });

                            if (UserDB) {
                                await UserDB.updateOne({
                                    UserID: user.id,
                                    Wallet: UserDB.Wallet + aM,
                                    Bank: UserDB.Bank
                                });
                                return
                            };

                            if (!UserDB) {
                                await new DB({
                                    UserID: user.id,
                                    Wallet: aM,
                                    Bank: 0
                                }).save();

                                return;
                            }
                        }

                        if (hateReviews > likeReviews) {
                            const theyDontLikeIt = new MessageEmbed()
                                .setAuthor(`${guild.name} Server | Use`)
                                .setDescription(`${user}, Sadly they don't like your meme posted on ${options[randOptions]}, In return you got nothing for your bad work.`)
                                .setColor("RED")
                                .setTimestamp()
                                .setFooter(guild.name, guild.iconURL({ dynamic: true }));

                            return interaction.followUp({ embeds: [theyDontLikeIt] });
                        }
                    });
                };

                if (reason == "call") {
                    interaction.followUp({ content: `${user} is ringing the developer.` }).then(async (msg) => {
                        await sleep(1.5)
                        msg.edit({ content: `${user} is ringing the developer..` });
                        await sleep(1.5)
                        msg.edit({ content: `${user} is ringing the developer...` });
                        await sleep(1.5)
                        msg.edit({ content: `${user} is ringing the developer.` });
                        await sleep(1.5)
                        msg.edit({ content: `${user} is ringing the developer..` });
                        await sleep(1.5)
                        msg.edit({ content: `${user} is ringing the developer...` });
                        await sleep(1.5)
                        const connectedLol = new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Voice Connected`)
                            .setDescription(`${user.username} > Why do you make the bot bad?`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }))

                        interaction.followUp({ embeds: [connectedLol] }).then(async (msg) => {
                            await sleep(1.5);
                            const connectedLol1 = new MessageEmbed()
                                .setAuthor(`${guild.name} Server | Voice Connected`)
                                .setDescription(`${user.username} > Why do you make the bot bad?\nEdemarz > It's not bad, it's perfect.`)
                                .setColor("BLUE")
                                .setTimestamp()
                                .setFooter(guild.name, guild.iconURL({ dynamic: true }))

                            msg.edit({ embeds: [connectedLol1] });
                            await sleep(1.5);
                            const connectedLol2 = new MessageEmbed()
                                .setAuthor(`${guild.name} Server | Voice Connected`)
                                .setDescription(`${user.username} > Why do you make the bot bad?\nEdemarz > It's not bad, it's perfect.\n${user.username} > No u, Now goodbye lol.`)
                                .setColor("BLUE")
                                .setTimestamp()
                                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                            msg.edit({ embeds: [connectedLol2] });
                            await sleep(1.5);
                            const connectedLol3 = new MessageEmbed()
                                .setAuthor(`${guild.name} Server | Voice Disconnected`)
                                .setDescription(`${user.username} > Why do you make the bot bad?\nEdemarz > It's not bad, it's perfect.\n${user.username} > No u, Now goodbye lol.\n\nCall Ended.`)
                                .setColor("BLUE")
                                .setTimestamp()
                                .setFooter(guild.name, guild.iconURL({ dynamic: true }))

                            msg.edit({ embeds: [connectedLol3] });
                        })
                    })
                }
            });
        };

        if (item == "padlock") {
            const confirmationEmbed = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Use`, guild.iconURL({ dynamic: true }))
                .setDescription(`${user}, Are you sure you want to use a padlock?\n**Note**: If you already have a Padlock active, This effect does not stack, instead it resets the previous padlock duration to 2 hours again!\n\nType \`Use my padlock\` to confirm using your Padlock, And anything else to cancel!\n\nYou have 15 seconds!`)
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setColor("BLURPLE")
                .setThumbnail(guild.iconURL({ dynamic: true }))


            const msgToEdit = await interaction.followUp({
                embeds: [confirmationEmbed]
            });

            const filter = m => m.author.id === user.id && !m.author.bot;

            const padlockConfirmation = await interaction.channel.createMessageCollector({ filter, time: 15000 });

            padlockConfirmation.on('collect', (message) => {
                if (message.content?.toLowerCase() == "use my padlock") padlockConfirmation.stop("use");
                else padlockConfirmation.stop("cancel")
            });

            padlockConfirmation.on("end", async (collected, reason) => {
                if (reason == "use") {
                    const UserActiveEffects = await ActiveEffects.findOne({
                        UserID: user.id
                    });

                    if (UserActiveEffects) {
                        const filteredEffects = [];

                        let index = 0;

                        await UserActiveEffects.Effects.filter((ef) => ef.name?.toLowerCase() != "padlock").forEach((ef) => filteredEffects.push(ef));

                        await filteredEffects.push({ name: "padlock" });

                        const filteredInvs = [];
                        
                        await UserInv.Inventory.forEach((invItem) => {
                            if (index >= 1) return;
                            if (invItem.item?.toLowerCase()?.trim() == "padlock") index++;
                            if (invItem.item?.toLowerCase()?.trim() != "padlock") filteredInvs.push(invItem)
                        });

                        await UserInv.updateOne({
                            UserID: user.id,
                            Inventory: filteredInvs,
                            Networth: UserInv.Networth
                        });

                        await UserActiveEffects.updateOne({
                            UserID: user.id,
                            Effects: filteredEffects
                        });

                        interaction.channel.send({ embeds: [
                            new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Padlock Used`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have used your padlock!\nYour wallet is now secured from robbers for 2 hours!`)
                            .setColor("BLURPLE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                        ]});

                        setTimeout(async () => {
                        const filteredEffects1 = [];

                        await UserActiveEffects.Effects.filter((ef) => ef.name?.toLowerCase() != "padlock").forEach((ef) => filteredEffects1.push(ef));

                        await UserActiveEffects.updateOne({
                            UserID: user.id,
                            Effects: filteredEffects
                        });
                        }, 7200000);
                    };

                    if (!UserActiveEffects) {
                        await new ActiveEffects({
                            UserID: user.id,
                            Effects: [{ name: "padlock" }]
                        }).save();

                        const filteredInvs = [];

                        let index = 0;
                        
                        await UserInv.Inventory.forEach((invItem) => {
                            if (index >= 1) return;
                            if (invItem.item?.toLowerCase()?.trim() == "padlock") index++;
                            if (invItem.item?.toLowerCase()?.trim() != "padlock") filteredInvs.push(invItem)
                        });

                        await UserInv.updateOne({
                            UserID: user.id,
                            Inventory: filteredInvs,
                            Networth: UserInv.Networth - 10000
                        });

                        interaction.channel.send({ embeds: [
                            new MessageEmbed()
                            .setAuthor(`${guild.name} Server | Padlock Used`, guild.iconURL({ dynamic: true }))
                            .setDescription(`${user}, You have used your padlock!\nYour wallet is now secured from robbers for 2 hours!`)
                            .setColor("BLURPLE")
                            .setTimestamp()
                            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                        ]});

                        setTimeout(async () => {
                        const filteredEffects1 = [];

                        await UserActiveEffects.Effects.filter((ef) => ef.name?.toLowerCase() != "padlock").forEach((ef) => filteredEffects1.push(ef));

                        await UserActiveEffects.updateOne({
                            UserID: user.id,
                            Effects: filteredEffects
                        });
                        }, 7200000);
                    }
                }
                if (reason == "cancel") {
                    const canceled = new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Canceled`, guild.iconURL({ dynamic: true }))
                    .setDescription(`${user}, You have canceled using your padlock!\nTip: Protecting your wallet from robbers is always noice :wink:`)
                    .setColor("BLURPLE")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))

                    return interaction.channel.send({ embeds: [canceled] })
                };
            });
        }
    }
}