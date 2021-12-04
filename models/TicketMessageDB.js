const mongoose = require("mongoose");

const Ticket = mongoose.Schema({
    GuildID: String,
    MessageID: String
});

const model = mongoose.model("TicketMsgDB", Ticket);

module.exports = model;