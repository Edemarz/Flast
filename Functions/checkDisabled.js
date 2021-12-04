const EcoSettings = require("../models/EcoSettings");

async function checkDisabled(id, cmd) {
    const searched = await EcoSettings.findOne({
        GuildID: id
    });

    if (searched && searched.Disabled) {
        if (searched.Disabled.Commands.includes(cmd)) return true
    }

    return false
};

module.exports = checkDisabled;