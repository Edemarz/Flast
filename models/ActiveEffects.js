const mongoose = require("mongoose");

const db = mongoose.Schema({
    UserID: String,
    Effects: Array
});

const mdl = mongoose.model(
    "ActiveEffects-DB",
    db
);

module.exports = mdl;