module.exports = {
    Functions: require("./GlobalFunctions"),
    Settings: require("./ClientData.json")
};

/**
 * Export all the data we need, do not export the dashbaord because requiring it will run it.
 */