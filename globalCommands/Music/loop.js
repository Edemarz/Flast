const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music-loop")
    .setDefaultPermission(true)
    .setDescription("Loop the current playing music or loop the queue!"),
  //.addStringOption((option) => option.setName("type").setDescription("Loop the queue or current playing music!").setRequired(true)),
  category: "Music",
  usage: "/music-loop",
  perm: "Send Messages",
  async execute(client, interaction, Discord) {
    const { options, member, user, guild } = interaction;

    if (!member.voice.channel)
      return interaction.followUp({
        content: `${user}, You need to be in a voice channel to execute this command!`,
      });
    if (!client.queue.get(guild.id))
      return interaction.followUp({
        content: `${user}, There is currently no songs playing/in the queue.`,
      });

    if (client.loop.get(guild.id)) {
      client.loop.delete(guild.id);

      const queueOffSongOn = client.createEmbed({
        text: `${user}, Turned off Song Loop!`,
        color: "BLURPLE",
        footerOne: user.tag,
        footerTwo: user.displayAvatarURL({ dynamic: true }),
        thumbnail: guild.iconURL({ dynamic: true }),
      });

      return interaction.followUp({ embeds: [queueOffSongOn] });
    }

    if (!client.loop.get(guild.id)) {
        client.loop.set(guild.id, true);

      const queueOffSongOn = client.createEmbed({
        text: `${user}, Turned On Song Loop!`,
        color: "BLURPLE",
        footerOne: user.tag,
        footerTwo: user.displayAvatarURL({ dynamic: true }),
        thumbnail: guild.iconURL({ dynamic: true }),
      });

      return interaction.followUp({ embeds: [queueOffSongOn] });
    }

    // const loopType = options.getString("type")?.toLowerCase();

    // const WrongType = client.createEmbed({
    //     text: `${user}, The loop type **${loopType}** is not a valid loop type!\nLoop Types:\n- Queue\n- Song`,
    //     color: "RED",
    //     footerOne: user.tag,
    //     footerTwo: user.displayAvatarURL({ dynamic: true }),
    //     thumbnail: guild.iconURL({ dynamic: true })
    // });

    // if (!["queue", "song"].includes(loopType)) return interaction.followUp({ embeds: [WrongType] });

    // if (["queue"].includes(loopType)) {
    //     if (client.loop.get(guild.id)) {
    //         client.loop.delete(guild.id);

    //         const songLoopOffQueueLoopOn = client.createEmbed({
    //             text: `${user}, Turned off Song Loop and Turned On Queue Loop!`,
    //             color: "BLURPLE",
    //             footerOne: user.tag,
    //             footerTwo: user.displayAvatarURL({ dynamic: true }),
    //             thumbnail: guild.iconURL({ dynamic: true })
    //         });

    //         client.queueLoop.set(guild.id, true);
    //         return interaction.followUp({ embeds: [songLoopOffQueueLoopOn] });
    //     };
    //     client.queueLoop.set(guild.id, true);

    //     const queueLoopOn = client.createEmbed({
    //         text: `${user}, Turned on Queue Loop!`,
    //         color: "BLURPLE",
    //         footerOne: user.tag,
    //         footerTwo: user.displayAvatarURL({ dynamic: true }),
    //         thumbnail: guild.iconURL({ dynamic: true })
    //     });

    //     return interaction.followUp({ embeds: [queueLoopOn] });
    // };

    // if (["song"].includes(loopType)) {
    //     if (client.queueLoop.get(guild.id)) {
    //         client.queueLoop.delete(guild.id);

    //         const queueOffSongOn = client.createEmbed({
    //             text: `${user}, Turned off Queue Loop and Turned On Song Loop!`,
    //             color: "BLURPLE",
    //             footerOne: user.tag,
    //             footerTwo: user.displayAvatarURL({ dynamic: true }),
    //             thumbnail: guild.iconURL({ dynamic: true })
    //         });

    //         client.loop.set(guild.id, true);
    //         return interaction.followUp({ embeds: [queueOffSongOn] });
    //     };
    //     client.loop.set(guild.id, true);

    //     const songLoopOn = client.createEmbed({
    //         text: `${user}, Turned on Song Loop!`,
    //         color: "BLURPLE",
    //         footerOne: user.tag,
    //         footerTwo: user.displayAvatarURL({ dynamic: true }),
    //         thumbnail: guild.iconURL({ dynamic: true })
    //     });

    //     return interaction.followUp({ embeds: [songLoopOn] });
    // }
  },
};
