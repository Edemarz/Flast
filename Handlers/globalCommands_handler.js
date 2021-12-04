const fs = require("fs");

module.exports = (client, Discord) => {
    const subfolders = fs.readdirSync("./globalCommands").filter((file) => !file.endsWith('.js')); //JavaScript Files Not Allowed!

    for (const folder of subfolders) {
        const cmd_files = fs.readdirSync(`./globalCommands/${folder}`).filter((file) => file.endsWith('.js')); //JavaScript Files Only!

        client.categories.push(folder)

        for (const file of cmd_files) {
            const command = require(`../globalCommands/${folder}/${file}`);

            if (command.data && command.data.name) {
                client.commands.set(command.data.name, command);
                client.globalCommands.push(command.data.toJSON());
            } else { continue; }
        }
    }
}