import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { createWebServer } from './web/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const mod = await import(pathToFileURL(path.join(commandsPath, file)).href);
  const command = mod.default;
  client.commands.set(command.data.name, command);
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const mod = await import(pathToFileURL(path.join(eventsPath, file)).href);
  const event = mod.default;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Start web server once bot is ready
client.once('clientReady', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  createWebServer(client);
});

client.login(process.env.DISCORD_TOKEN);
