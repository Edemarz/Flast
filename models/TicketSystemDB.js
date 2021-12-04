const mongoose = require("mongoose");

const Ticket = mongoose.Schema({
    GuildID: String,
    Description: String,
    TicketManager: String,
    TicketChannel: String,
    Color: String,
    Title: String
});

const model = mongoose.model("TicketMainDB", Ticket);

module.exports = model;