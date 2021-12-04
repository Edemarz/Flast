const mongoose = require("mongoose");

const db = mongoose.Schema({
    GuildID: String,
    Disabled: Object,
    Amount: Number
});

const mdl = mongoose.model(
    "EcoSettings-DB",
    db
);

module.exports = mdl;