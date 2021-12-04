const mongoose = require("mongoose");

const DB = mongoose.Schema({
    GuildID: String,
    MuteRole: String,
    MemberRole: String
});

const model = mongoose.model("Mute-System", DB);

module.exports = model;