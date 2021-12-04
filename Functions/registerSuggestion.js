const MessageDB = require("../models/SuggestionDB");

function registerSuggestion(msgResolveable, guild, user) {
    new MessageDB({
        GuildID: guild.id,
        MessageID: msgResolveable.id,
        Author: user.id
    }).save()
};

module.exports = registerSuggestion;