const mongoose = require("mongoose");

const DB = mongoose.Schema({
    GuildID: String,
    MessageID: String
});

const mdl = mongoose.model(
    "VerificationSystem-Message-DB",
    DB
);

module.exports = mdl;