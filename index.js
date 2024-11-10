const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
let nodeCleanup = require('node-cleanup');
const { token } = require('./config.json');
const log = require("./src/utils/log.js");

process.stdout.write(String.fromCharCode(27) + "]0;" + `CelesteBOT` + String.fromCharCode(7));

log.start("Starting up!")
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.cooldowns = new Collection();

//Load font
Canvas.GlobalFonts.registerFromPath('./assets/Renogare.ttf', 'Renogare');

//Load command files
let commands = 0;
client.commands = new Collection();
const commandFolder = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandFolder);
for (const commandFile of commandFiles) {
	const commandFilePath = path.join(commandFolder, commandFile);
	const command = require(commandFilePath);
	if ('data' in command && 'execute' in command) { client.commands.set(command.data.name, command); commands++ }
    else { log.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`) };
};
log.start(`Loaded ${commands} commands`);

//Load events
let events = 0;
const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
    events++;
	if (event.once) { client.once(event.name, (...args) => event.execute(...args)) }
    else { client.on(event.name, (...args) => event.execute(...args)) };
};
log.start(`Loaded ${events} events`);

client.login(token);

async function cleanup(exitCode, signal) {
    log.exit("Exiting node...");
    await client.destroy();
    process.kill(process.pid, signal);
};

nodeCleanup(function (exitCode, signal) {
    cleanup(exitCode, signal);
    nodeCleanup.uninstall();
    return false;
});