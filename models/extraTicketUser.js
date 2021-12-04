const mongoose = require("mongoose");

const DB = mongoose.Schema({
    GuildID: String,
    Ticket: String,
    TicketOwner: String,
    ExtraUser: Array,
    AmountOfExtraUser: Number
});

const model = mongoose.model("ExtraUser", DB);

module.exports = model;