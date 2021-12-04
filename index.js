/*
The Center of all Processes of Flast, The Discord Bot!
Also i made the cool sentence for flex xD
*/

//Imports & Destructuring
const Discord = require("discord.js");
const { Client, Intents, Permissions, MessageEmbed, Collection } = require("discord.js");
require("dotenv").config();
const allIntents = new Intents(32767); //Represents all the Intents!

const client = new Client({ intents: [allIntents], partials: ["MESSAGE", "CHANNEL", "REACTION"] });
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");
const mongoose = require("mongoose");
const ytSearch = require("yt-search");
const { DiscordTogether } = require('discord-together');

//Binding a property with client to make it global.

client.discordTogether = new DiscordTogether(client);
client.functions = require("./GlobalFunctions");

client.commands = new Collection();
client.events = new Collection();
client.globalCommands = [];
client.cooldown = new Map();
client.commands = new Collection();
client.deletedMessages = [];
client.validatedColors = ["AQUA", "BLUE", "BLURPLE", "DARKER_GREY", "DARK_AQUA", "DARK_BLUE", "DARK_BUT_NOT_BLACK", "DARK_GOLD", "DARK_GREEN", "DARK_GREY", "DARK_NAVY", "DARK_ORANGE", "DARK_PURPLE", "DARK_RED", "DARK_VIVID_PINK", "DEFAULT", "FUCHSIA", "GOLD", "GREEN", "GREY", "GREYPLE", "LIGHT_GREY", "LUMINOUS_VIVID_PINK", "NAVY", "NOT_QUITE_BLACK", "ORANGE", "PURPLE", "RANDOM", "RED", "WHITE", "YELLOW"];
client.colorText = function colorText(text) {
    if (!client.readyAt) return;
    return `${require("colors").cyan(`${client.user.username} Client Logs`)} ${require("colors").gray("| ")}${require("colors").cyan(new Date(Date.now()).toLocaleDateString())} ${require("colors").magenta(" [::] ")}${require("colors").white(text)}`
}; //Color Text!!!!!!!
client.config = require("./ClientData.json");
client.jobs = [
    {
        job: "Discord Moderator",
        salaryRange: 3200,
        label: "Discord Moderator",
        value: "discord-mod--work",
        description: "Select your job as a Discord Moderator!"
    },
    {
        job: "Flast Developer",
        salaryRange: 7200,
        label: "Flast Developer",
        value: "flast-dev--work",
        description: "Select your job as a Flast Discord Bot Developer!"
    },
    {
        job: "Robber",
        salaryRange: 40000,
        hasDeath: true,
        label: "Robber",
        value: "robber--work",
        description: "Select your job as a Robber!"
    },
    {
        job: "Janitor",
        salaryRange: 7000,
        label: "Janitor",
        value: "janitor--work",
        description: "Select your job as a Janitor!"
    },
    {
        job: "Nurse",
        salaryRange: 2130,
        label: "Nurse",
        value: "nurse--work",
        description: "Select your job as a Nurse!"
    },
    {
        job: "Covid-19 Doctor",
        salaryRange: 1100,
        hasDeath: true,
        label: "Covid-19 Doctor",
        value: "covid-19-doctor--work",
        description: "Select your job as a Covid-19 Doctor!"
    }
];

client.queue = new Map();
client.loop = new Map();
client.queueLoop = new Map();
client.audioPlayer = new Map();
client.findVideo = async function(query) {
    const result = await ytSearch(query);
    return (result.videos.length > 1) ? result.videos[0] : null
};
client.connection = new Map();
client.createEmbed = function(option = {}) {
    if (!option) return;
    const embed = new MessageEmbed()
    .setDescription(option.text)
    .setColor(option.color)
    .setFooter(option.footerOne, option.footerTwo)
    .setThumbnail(option.thumbnail)
    .setTimestamp()

    return embed;
};
client.Permissions = Permissions.FLAGS;
client.categories = [];
client.capitalizeFirst = function(text) {
    let firstLet = text.substring(0, 1);
    let restLet = text.substring(1, text.length);
    
    return firstLet?.toUpperCase() + restLet?.toLowerCase();
};

//Run the handlers

["globalCommands_handler", "event_handler"].forEach((handler) => {
    require(`./Handlers/${handler}`)(client, Discord);
});

//Connect to MongoDB Database

mongoose.connect(process.env.MONGO_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log(`${require("colors").cyan(`Flast Client Logs`)} ${require("colors").gray("| ")}${require("colors").cyan(new Date(Date.now()).toLocaleDateString())} ${require("colors").magenta(" [::] ")}${require("colors").white("Connected to MongoDB Database!")}`)).catch((err) => console.log(err));

//Start a new REST Session & Load the Slash Commands!

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

require("./DeploySlashCmd")(client, rest, Routes);

//Login the the Discord Bot

client.login(process.env.DISCORD_TOKEN);

//Credit Section
/*
Discord Bot Name: Flast
Version: Alpha 1.0.0
Developed by: Edemarz#6565
Given To: TheLight#5002
Started At: 26/11/2021 | 26 November 2021.
Type: Multi Purpose Discord Bot
Note: Please do not remove this
*/