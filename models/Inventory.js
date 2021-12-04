const mongo = require("mongoose");

const db = mongo.Schema({
    UserID: String,
    Inventory: Array,
    Networth: Number
});

const mdl = mongo.model(
    "Economy-Inventory-DB",
    db
);

module.exports = mdl;