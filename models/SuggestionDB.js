const mongoose = require("mongoose");

const db = mongoose.Schema({
    GuildID: String,
    MessageID: String,
    Author: String
});

const exportModel = mongoose.model(
    "Suggestion-DB",
    db
);

module.exports = exportModel;