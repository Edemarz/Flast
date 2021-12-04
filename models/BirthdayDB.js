const mongoose = require("mongoose");

const db = mongoose.Schema({
    GuildID: String,
    User: String,
    Birthday: String
});

const mdl = mongoose.model(
    "Birthday-DB",
    db
);

module.exports = mdl;