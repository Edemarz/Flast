module.exports = (Discord, client, message) => {
    if (!message.guild || !message.channel || !message.content || message.author.bot) return;
    if (client.deletedMessages && client.deletedMessages.length > 7) client.deletedMessages.length = 0; //Clears the array since we only want 7 deleted messages, why? So it doesn't lag the bot

    client.deletedMessages.push({ content: message.content, author: message.author, deletedAt: Date.now(), createdAt: message.createdTimestamp });
};

/*
I made this copde to specifically be Back End JavaScript so it does not affect performance or lag at all
*/