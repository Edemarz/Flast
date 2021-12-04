const mongoose = require("mongoose");

const db = mongoose.Schema({
    GuildID: String,
    ChannelID: String
});

const mdl = mongoose.model(
    "Suggestion-Channel-DB",
    db
);

module.exports = mdl;