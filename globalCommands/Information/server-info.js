const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Guild } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("server-info")
    .setDefaultPermission(true)
    .setDescription("Get information about the server!"),
    category: "Information",
    usage: "/server-info",
    perm: "Send Messages",
    async execute(client, interaction, Discord) {
        const { guild, member, user } = interaction;

        const msg = await interaction.followUp({ content: `Please wait while i get the server data.....` });

        const owner = await guild.members.cache.get(guild.ownerId)

        let TextChannels = 0;
        let voiceChannel = 0;
        let categories = 0;
        let announcement_channels = 0;
        let public_threads = 0;
        let private_threads = 0;
        let news_threads = 0;
        
        guild.channels.cache.forEach((channel) => {
            if (channel.type == "GUILD_TEXT") return TextChannels++;
            if (channel.type == "GUILD_CATEGORY") return categories++;
            if (channel.type == "GUILD_VOICE") return voiceChannel++;
            if (channel.type == "GUILD_NEWS") return announcement_channels++;
            if (channel.type == "GUILD_PUBLIC_THREAD") return public_threads++;
            if (channel.type == "GUILD_PRIVATE_THREAD") return private_threads++;
        })

        const infoEmbed = new MessageEmbed()
        .setAuthor(`${guild.name} Server | Information`, guild.iconURL({ dynamic: true }))
        .setDescription(`Server Name: ${guild.name}\nServer ID: ${guild.id}\nServer Acronym: ${guild.nameAcronym}\nServer Boosts: ${guild.premiumSubscriptionCount?.toLocaleString()} Boosts\nServer Boost Level: ${(isNaN(guild.premiumTier) === true) ? client.capitalizeFirst(guild.premiumTier?.toLocaleString()) : guild.premiumTier?.toLocaleString()}\nServer Rule Channel: ${guild.rulesChannel ? `<#${guild.rulesChannel.id}>` : "No Rules Channel"}\nServer Vanity URL: ${guild.vanityURLCode ? `https://discord.com/${vanityURLCode}` : "No Vanity URL"}\nCreated At: ${new Date(guild.createdTimestamp).toLocaleDateString()} | Format: DD/MM/YY\nOwner ID: ${guild.ownerId}\n
        Member Count: ${guild.memberCount?.toLocaleString()} Members\nText Channel: ${TextChannels?.toLocaleString()} Text Channels\nVoice Channel: ${voiceChannel?.toLocaleString()} Voice Channels\n
        Category: ${categories} Categories\nAnnouncement Channel: ${announcement_channels?.toLocaleString()} Channels\nPublic Threads: ${public_threads?.toLocaleString()} Threads\nPrivate Threads: ${private_threads?.toLocaleString()} Threads\n
        Announcement Channel Threads: ${news_threads?.toLocaleString()} Threads\nAFK Channel: ${guild.afkChannel ? guild.afkChannel.name : "No AFK Channel"}\nGuild IconURL: [Click Here](${guild.iconURL({ dynamic: true })})\n
        Maximum Members: ${guild.maximumMembers?.toLocaleString()}\n
        MFA Level: ${client.capitalizeFirst(guild.mfaLevel)}\nNSFW Level: ${client.capitalizeFirst(guild.nsfwLevel)}\nPartnered: ${guild.partnered ? "True" : "False"}\nServer Verification Level: ${client.capitalizeFirst(guild.verificationLevel)}\nVerified: ${guild.verified ? "True" : "False"}\nWidget Channel: ${guild.widgetChannel ? `<@${guild.widgetChannel.id}>` : "No Widget Channel"}\n
        Server Banner URL: ${guild.bannerURL() ? `[Click Here](${guild.bannerURL({ format: 'png', size: '4096' })})` : "No Banner URL"}`)
        .setColor("BLURPLE")
        .setTimestamp()
        .setFooter(guild.name, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true }))

        return msg.edit({ embeds: [infoEmbed] });
    }
}