module.exports = async (client, rest, Routes) => {
    if (!client.globalCommands || client.globalCommands.length < 1) return;
    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: client.globalCommands }
        )
    } catch (err) { console.log(err); };
}