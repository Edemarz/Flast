const mongoose = require("mongoose");

const db = mongoose.Schema({
    UserID: String,
    Wallet: Number,
    Bank: Number
});

const mdl = mongoose.model(
    "Economy-DB",
    db
);

module.exports = mdl;