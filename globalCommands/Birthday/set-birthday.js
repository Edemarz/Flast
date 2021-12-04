//Global Constants
const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require("../../models/BirthdayDB");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("set-birthday")
    .setDefaultPermission(true)
    .setDescription("Set your birthday date, and we will remind you when it comes!")
    .addNumberOption((option) => option.setName("month").setDescription("The month of your birthday!")
    .addChoice("January", 1)
    .addChoice("February", 2)
    .addChoice("March", 3)
    .addChoice("April", 4)
    .addChoice("May", 5)
    .addChoice("June", 6)
    .addChoice("July", 7)
    .addChoice("August", 8)
    .addChoice("September", 9)
    .addChoice("October", 10)
    .addChoice("November", 11)
    .addChoice("December", 12)
    .setRequired(true))
    .addNumberOption((option) => option.setName("day").setDescription("The day of your birthday!").setRequired(true)),
    category: "Birthday",
    usage: "/set-birthday <Month> <Birthday Date (Example: 9)>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        //Destructuring
        const { options, member, guild, user } = interaction;
        const { MessageEmbed, Message } = require("discord.js");
        //Defining
        const month = options.getNumber("month");
        const day = options.getNumber("day");
        const ValidateBirthday = require("../../Functions/ValidateBirthday");
        const getMonth = require("../../Functions/getMonth");
        let ValidationSuccess;
        //Validating Birthday
        const Validation = ValidateBirthday(day, month);

        if (Validation.success === false && Validation.code === 1002) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, No decimals are allowed in the day date!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        if (Validation.success === false && Validation.code === 901) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, Day 0 is an Invalid Day!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] })

        if (Validation.success === false && Validation.code === 2002) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You cannot have more than 28 days in February!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        if (Validation.success === false && Validation.code === 3002) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You cannot have ${day} days in ${getMonth(month)}!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        if (Validation.success === false && Validation.code === 403) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You cannot have more than 31 days in ${getMonth(month)}`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        if (Validation.success === false && Validation.code === 405) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You cannot have more than 30 days in ${getMonth(month)}`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] })

        if (Validation.success === true && Validation.code === 200) ValidationSuccess = { success: true, code: 200 };
        //Checking Validation
        if (ValidationSuccess && !ValidationSuccess.success === true && !ValidationSuccess.code === 200) return interaction.followUp({ embeds: [
            new MessageEmbed()
            .setAuthor(`${guild.name} Server | Validation Error`, guild.iconURL({ dynamic: true }))
            .setColor("RED")
            .setDescription(`${user}, Unable to Validate the Birthday Date, Please try again!`)
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true }))
        ] });

        if (ValidationSuccess && ValidationSuccess.success === true && ValidationSuccess.code === 200) {
            const CheckingDB = await DB.findOne({
                GuildID: guild.id,
                User: user.id
            });

            if (CheckingDB) {
                await CheckingDB.updateOne({
                    GuildID: guild.id,
                    User: user.id,
                    Birthday: `${day}/${month} | ${day} of ${getMonth(month)}`
                });

                const ValidatedAndUpdated = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Birthday`, guild.iconURL({ dynamic: true }))
                .setDescription(`${user}, You have successfuly changed your birthday to ${day} of ${getMonth(month)}!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [ValidatedAndUpdated] })
            }

            if (!CheckingDB) {
                await new DB({
                    GuildID: guild.id,
                    User: user.id,
                    Birthday: `${day}/${month} | ${day} of ${getMonth(month)}`
                }).save();

                const ValidatedAndUpdated = new MessageEmbed()
                .setAuthor(`${guild.name} Server | Birthday`, guild.iconURL({ dynamic: true }))
                .setDescription(`${user}, You have successfuly setted your birthday to ${day} of ${getMonth(month)}!`)
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setThumbnail(guild.iconURL({ dynamic: true }))

                return interaction.followUp({ embeds: [ValidatedAndUpdated] })
            }
        }
    }
}
/*
Note: Hello TheLight#5002, If you are reading this, then congratulations, The FLAST Discord Bot has been finished!
- Edemarz#6565
*/