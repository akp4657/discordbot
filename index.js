// Require the necessary discord.js classes

//const token = process.env.BOT_TOKEN;
const { token } = require('../discordbot/config');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('child_process');
const cron = require('node-cron');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

function runCommandBuilder() {
	exec('node deploy-commands.js', (error, stdout, stderr) => {
	  if (error) {
		console.error(`Error: ${error.message}`);
		return;
	  }
	  if (stderr) {
		console.error(`Stderr: ${stderr}`);
		return;
	  }
	  console.log(`Output: ${stdout}`);
	});
  }

cron.schedule('0 0 * * *', () => runCommandBuilder())

runCommandBuilder();
client.login(token);