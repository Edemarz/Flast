const mongoose = require("mongoose");

const db = mongoose.Schema({
    UserID: String,
    Work: Object
});

const mdl = mongoose.model(
    "Work-DB",
    db
);

module.exports = mdl;