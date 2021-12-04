const mongoose = require("mongoose");

const afkDB = mongoose.Schema({
    GuildID: String,
    UserID: String,
    Reason: String,
    AfkAt: Number
});

const model = mongoose.model("AFK-DB", afkDB);

module.exports = model;