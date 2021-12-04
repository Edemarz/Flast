//Importing
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const fetch = require("node-fetch");

//Exporting Command
module.exports = {
    data: new SlashCommandBuilder()
    .setName("youtube-together")
    .setDefaultPermission(true)
    .setDescription("Start a YouTube Together Session!"),
    category: "Tools",
    usage: "/youtube-together",
    perm: "Send Messages",
    execute(client, interaction, Discord) {
        //Destructuring Interaction
        const { member, user, guild } = interaction;
        //Command System
        const memberVc = member.voice.channel;

        if (!memberVc) return interaction.followUp({ embeds: [
            client.createEmbed({
                text: `${user}, You need to be in a Voice Channel to start a YouTube Together Session!`,
                color: "RED",
                footerOne: guild.name,
                footerTwo: guild.iconURL({ dynamic: true }),
                thumbnail: guild.iconURL({ dynamic: true })
            })
        ]});

        fetch(`https://discord.com/api/v8/channels/${memberVc.id}/invites`, {
            method: "POST",
            body: JSON.stringify({
                max_age: 86400,
                max_uses: 0,
                target_application_id: "755600276941176913",
                target_type: 2,
                temporary: false,
                validate: null
            }),
            headers: {
                "Authorization": `Bot ${process.env.DISCORD_TOKEN}`,
                "Content-Type": "application/json"
            }
        })

            .then(res => res.json())
            .then(async (invite) => {
                const RIP = new MessageEmbed()
                    .setAuthor(`${guild.name} Server | YouTube Together`)
                    .setDescription("Sadly i cannot start a YouTube Together!")
                    .setColor("RED")
                    .setTimestamp()
                    .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }));

                if (!invite.code) return interaction.channel.send({ embeds: [RIP] });
                const e = new MessageEmbed()
                    .setAuthor(`${guild.name} Server | YouTube Together`)
                    .setColor('BLURPLE')
                    .setThumbnail('https://media.discordapp.net/attachments/796358841038143488/851878274179399751/youtube.png')
                    .setDescription(`\nTo watch Youtube Together [Click Me!](https://discord.com/invite/${invite.code})`)
                    .setTimestamp()

                const button = new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Open YouTube Together!')
                    .setURL(`https://discord.com/invite/${invite.code}`);

                interaction.channel.send({
                    embeds: [e],
                    components: [
                        new MessageActionRow().addComponents([button])
                    ]
                });
            });
    }
}