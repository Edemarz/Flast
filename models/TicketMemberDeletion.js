const mongoose = require("mongoose");

const TicketDeletion = mongoose.Schema({
    GuildID: String
});

const model = mongoose.model("TicketDeletionDB", TicketDeletion);

module.exports = model;