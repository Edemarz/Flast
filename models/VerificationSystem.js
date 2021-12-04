const mongoose = require("mongoose");

const db = mongoose.Schema({
    GuildID: String,
    VerificationChannel: String,
    VerificationRole: String,
    VerificationType: Object
});

const DBModel = mongoose.model(
    "VerificationSystem-DB",
    db
);

module.exports = DBModel;