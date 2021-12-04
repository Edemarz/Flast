module.exports = async (client, rest, Routes) => {
    if (!client.globalCommands || client.globalCommands.length < 1) return;
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, "914702750095380530"),
            { body: client.globalCommands }
        )
    } catch (err) { console.log(err); };
}