const mongoose = require("mongoose");

const DB = mongoose.Schema({
    GuildID: String,
    ChannelID: String,
    User: String
});

const model = mongoose.model("TicketDB", DB);

module.exports = model;