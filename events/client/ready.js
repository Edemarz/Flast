module.exports = (Discord, client) => {
    const status = ["Flast | The best MultiPurpose Bot!", `${client.commands.size} Commands! | /help`];
    const type = ["WATCHING", "PLAYING"];
    let ind = 0;
    let tInd = 0;

    setInterval(() => {
        if (ind === status.length) ind = 0;
        if (tInd === type.length) tInd = 0;
        client.user.setActivity(status[ind], { type: type[tInd] });
        ind++;
        tInd++;
    }, 5000);

    console.log(`${client.colorText("Client Name: ")}${client.user.username}\n${client.colorText("Client Uptime: ")}${client.uptime}`);

    //Dashboard Section
    require("../../Dashboard/index")(client);
}