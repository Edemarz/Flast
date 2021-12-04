const { SlashCommandBuilder } = require("@discordjs/builders");
const DB = require("../../models/MuteDB");
const { Permissions } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("set-mute-system")
    .setDefaultPermission(true)
    .setDescription("Set the mute system to mute/unmute/temp-mute a user!")
    .addRoleOption((option) => option.setName("member-role").setDescription("Set the member role of the mute system!").setRequired(true))
    .addRoleOption((option) => option.setName("mute-role").setDescription("Set the mute role of the mute system!").setRequired(true)),
    category: "Settings",
    usage: "/set-mute-system <Member Role (Mention)> <Mute Role (Mention)>",
    perm: "Manage Guild",
    async execute(client, interaction, Discord) {
        const { user, guild, options } = interaction;

        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You need the permissions \`MANAGE_GUILD\` to execute this command!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ] });

        const memberRole = options.getRole("member-role");
        const muteRole = options.getRole("mute-role");

        const DBCheck = await DB.findOne({
            GuildID: guild.id,
        });

        if (DBCheck) {
            console.log("A")
            await DBCheck.updateOne({
                GuildID: guild.id,
                MuteRole: muteRole.id,
                MemberRole: memberRole.id
            });

            const updatedEmbed = client.createEmbed({
                text: `${user}, You have setted the Mute Role to <@&${muteRole.id}> and the Member Role to <@&${memberRole.id}>!`,
                color: "BLURPLE",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            });

            return interaction.followUp({ embeds: [updatedEmbed] });
        };

        if (!DBCheck) {
            await new DB({
                GuildID: guild.id,
                MuteRole: muteRole.id,
                MemberRole: memberRole.id
            }).save();

            const updatedEmbed = client.createEmbed({
                text: `${user}, You have setted the Mute Role to <@&${muteRole.id}> and the Member Role to <@&${memberRole.id}>!`,
                color: "BLURPLE",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            });

            return interaction.followUp({ embeds: [updatedEmbed] });
        }
    }
}