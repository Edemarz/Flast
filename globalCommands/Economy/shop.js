//Importing & Destructuring
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageSelectMenu, User } = require("discord.js");
const EconomyData = require("../../EconomyData");
const DB = require("../../models/EconomyDB");
const InvDB = require("../../models/Inventory");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("shop")
    .setDefaultPermission(true)
    .setDescription("Shop and buy some items you swaggers!")
    .addStringOption((opt) => opt.setName("item").setDescription("The item to buy!").setRequired(true))
    .addNumberOption((opt) => opt.setName("amount").setDescription("The amount of item you want to buy, defaults to 1!")),
    category: "Economy",
    perm: "Send Messages",
    usage: "/shop <Item>",
    async execute(client, interaction, Discord) {
        //Destructure Interaction
        const { member, user, guild, options } = interaction;

        //Command System
        const item = options.getString("item");
        let multiplierAmount;
        let realPrice;
        let included;

        const a = options.getNumber("amount");

        if (a) {
            if (a < 1) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You cannot have the amount lower than 1!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

            if (Number.isInteger(a) === false) return interaction.followUp({ embeds: [
                client.createEmbed({
                    text: `${user}, The amount cannot be decimals!`,
                    color: "RED",
                    footerOne: guild.name,
                    footerTwo: guild.iconURL({ dynamic: true }),
                    thumbnail: guild.iconURL({ dynamic: true })
                })
            ]});
        };

        await EconomyData.Shop.forEach((it) => {
            if (it.name?.toLowerCase() == item?.toLowerCase()) included = true
        });

        if (!included) return interaction.followUp({ embeds: [
            new MessageEmbed()
            .setAuthor(`${guild.name} Server | Shop`)
            .setDescription(`${user}, The item **${item}** does not exist!\nThese are the valid items:\n${(EconomyData.Shop).map((i) => `\`\`\`js\nItem: ${i.name}\nPrice: F$${i.price?.toLocaleString()}\n\`\`\``).join("\n").toString()}`)
            .setColor("BLURPLE")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        ]});

        const EcoPos = await EconomyData.Shop.findIndex((i) => i.name?.toLowerCase() == item?.toLowerCase());
        
        if (EcoPos?.toString() == "-1") return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, This is an internal error, but i cannot find the item data in the system. Please try again!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        const UserBalance = await DB.findOne({
            UserID: user.id
        });

        const CompleteItemData = EconomyData.Shop[EcoPos];

        if (a) realPrice = CompleteItemData.price * a;

        const av = realPrice ? realPrice : CompleteItemData.price;

        if (!UserBalance) {
            await new DB({
                UserID: user.id,
                Wallet: 0,
                Bank: 0
            }).save();

            return interaction.followUp({ embeds: [
                new MessageEmbed()
                .setAuthor(`${guild.name} Server | Shop`)
                .setDescription(`${user}, The item **${item}** cost F$${CompleteItemData.price?.toLocaleString()} each and you do not have any Flast Cash in your Wallet!`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            ]});
        };

        if (av > UserBalance.Wallet) return interaction.followUp({ embeds: [
            new MessageEmbed()
            .setAuthor(`${guild.name} Server | Shop`)
            .setDescription(`${user}, That item cost F$${CompleteItemData.price?.toLocaleString()} each and you only have F$${UserBalance.Wallet?.toLocaleString()}, Earn some more money first!`)
            .setColor("RED")
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        ]});

        const UserInv = await InvDB.findOne({
            UserID: user.id
        });

        if (UserInv) {
            if (a && realPrice) {
                await UserBalance.updateOne({
                    UserID: user.id,
                    Wallet: UserBalance.Wallet - realPrice,
                    Bank: UserBalance.Bank
                });

                for (let i = 0; i < a; i++) {
                    await UserInv.Inventory.push({ item: CompleteItemData.name, price: CompleteItemData.price });
                };

                await UserInv.updateOne({
                    UserID: user.id,
                    Inventory: UserInv.Inventory,
                    Networth: UserInv.Networth + realPrice
                });

                return interaction.followUp({ embeds: [
                    new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Shop`)
                    .setDescription(`${user}, You have bought ${a?.toLocaleString()} **${CompleteItemData.name}**s and paid F$${realPrice?.toLocaleString()}!`)
                    .setColor("BLURPLE")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                ]})
            };

            await UserBalance.updateOne({
                UserID: user.id,
                Wallet: UserBalance.Wallet - CompleteItemData.price,
                Bank: UserBalance.Banl
            });

            await UserInv.Inventory.push({ item: CompleteItemData.name, price: CompleteItemData.price });

            await UserInv.updateOne({
                UserID: user.id,
                Inventory: UserBalance.Inventory,
                Networth: UserInv.Networth + CompleteItemData.price
            });

            return interaction.followUp({ embeds: [
                new MessageEmbed()
                .setAuthor(`${guild.name} Server | Shop`)
                .setDescription(`${user}, You have bought 1 **${CompleteItemData.name}** and paid F$${CompleteItemData.price?.toLocaleString()}`)
                .setColor("BLURPLE")
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setTimestamp()
            ]})
        };

        if (!UserInv) {
            if (a && realPrice) {
                const inv = [];

                for (let i = 0; i < a; i++) {
                    inv.push({ item: CompleteItemData.name, price: CompleteItemData.price });
                };

                await new InvDB({
                    UserID: user.id,
                    Inventory: inv,
                    Networth: realPrice
                }).save();

                await UserBalance.updateOne({
                    UserID: user.id,
                    Wallet: UserBalance.Wallet - realPrice,
                    Bank: UserBalance.Bank
                });

                return interaction.followUp({ embeds: [
                    new MessageEmbed()
                    .setAuthor(`${guild.name} Server | Shop`)
                    .setDescription(`${user}, You have bought ${a?.toLocaleString()} **${CompleteItemData.name}**s and paid F$${realPrice?.toLocaleString()}`)
                    .setColor("BLURPLE")
                    .setTimestamp()
                    .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                ]});
            };

            await new InvDB({
                UserID: user.id,
                Inventory: [{ item: CompleteItemData.name, price: CompleteItemData.price }],
                Networth: CompleteItemData.price
            }).save();

            await UserBalance.updateOne({
                UserID: user.id,
                Wallet: UserBalance.Wallet - CompleteItemData.price,
                Bank: UserBalance.Bank
            });

            return interaction.followUp({ embeds: [
                new MessageEmbed()
                .setAuthor(`${guild.name} Server | Shop`)
                .setDescription(`${user}, You have bought 1 **${CompleteItemData.name}** and paid F$${CompleteItemData.price?.toLocaleString()}`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            ]})
        }
    }
}