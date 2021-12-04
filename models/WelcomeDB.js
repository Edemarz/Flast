const mongoose = require("mongoose");

const db = mongoose.Schema({
    GuildID: String,
    RoleID: String,
    ChannelID: String
    // Configuration: Object
});

const ModelDB = mongoose.model(
    "Welcome-DB",
    db
);

module.exports = ModelDB;