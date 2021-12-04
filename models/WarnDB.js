const mongoose = require("mongoose");

const DB = mongoose.Schema({
    GuildID: String,
    User: String,
    Warns: Array,
    Amount: Number
});

const model = mongoose.model("Warn-DB", DB);

module.exports = model;