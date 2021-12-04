const afkDB = require("../../models/afkDB");
const ms = require("ms");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("afk")
    .setDefaultPermission(true)
    .setDescription("Displays your name as AFK so users know you're afk!")
    .addStringOption((option) => option.setName("reason").setDescription("The reason you're afk.").setRequired(true)),
    category: "Tools",
    usage: "/afk <Reason>",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const { options, member, user, guild } = interaction;

        const reasoning = options.getString("reason"); // Guaranteed to exist because .setRequired() is set to true

        const checkingDB = await afkDB.findOne({
            GuildID: guild.id,
            UserID: user.id
        });

        if (checkingDB) {
        let afkAt = Date.now() - checkingDB.AfkAt;
        let remainingMinutes;
        let remainingSeconds;
        let divider;

        let backupAfk = afkAt;

        if (afkAt / 1000 / 60 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60 / 60) === true) afkAt = `${Math.round(afkAt / 1000 / 60 / 60)} hour(s) ago.`;
        if (afkAt / 1000 / 60 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60 / 60) === false) {
            remainingMinutes = `${afkAt / 1000 / 60 / 60}`.split('.')[1];
            if (!Number(remainingMinutes) / 1000 / 60 >= 1) afkAt = `${Math.round(afkAt / 1000 / 60 / 60)} hour(s) ago.`;
            if (Number(remainingMinutes) / 1000 / 60 >= 1) afkAt = `${Math.round(afkAt / 1000 / 60 / 60)} hour(s) and ${Math.round(Number(remainingMinutes) / 1000 / 60)} minute(s) ago.`;
        };
        if (afkAt / 1000 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60) === true) afkAt = `${Math.round(afkAt / 1000 / 60)} minute(s) ago.`;
        if (afkAt / 1000 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60) === false) {
            remainingSeconds = `${afkAt / 1000}`.split('.')[1];
            divider = `${afkAt / 1000 / 60}`.split('.')[0];
            divider = Number(divider);
            divider = divider * 60;
            remainingSeconds = Number(remainingSeconds) / divider;
            if (Math.round(remainingSeconds) >= 1) afkAt = `${Math.round(afkAt / 1000 / 60)} minute(s) ago.`;
            if (Math.round(remainingSeconds) >= 1) afkAt = `${Math.round(backupAfk / 1000 / 60)} minute(s) and ${Math.round(remainingSeconds)} second(s) ago.`
        }
        else afkAt = `${Math.round(afkAt / 1000)} second(s) ago.`;

            const notAfk = client.createEmbed({
                text: `${user}, You are now not AFK!\nAFK Reason: ${checkingDB.Reason}\nAFK: ${afkAt}`,
                color: "BLURPLE",
                footerOne: user.tag,
                footerTwo: user.displayAvatarURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            });

            interaction.followUp({ embeds: [notAfk] });

            member.setNickname(user.username, "Not AFK Anymore")

            checkingDB.deleteOne();
            return;
        };

        try {
            const newDB = new afkDB({
                GuildID: guild.id,
                UserID: user.id,
                Reason: reasoning,
                AfkAt: Date.now()
            }).save();

            const nowAfk = client.createEmbed({
                text: `${user}, You're now AFK - ${reasoning}`,
                color: "BLURPLE",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: user.displayAvatarURL({ dynamic: true })
            });

            member.setNickname(`[AFK] ${user.username}`, "Executed the AFK Command!").catch((err) => {
                console.log(err);
                interaction.followUp({ content: `Error: Couldn't change your name because you have higher role than me or you are the server owner!` })
            })

            interaction.followUp({ embeds: [nowAfk] });
        } catch (err) { console.log(err) };
    }
}