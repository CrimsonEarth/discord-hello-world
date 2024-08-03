// setup dotenv
require('dotenv').config();
const {Client, Events, GatewayIntentBits, Collection} = require('discord.js');
const { DISCORD_TOKEN } = process.env;
// load in the commands
const fs = require('fs');
const path = require('path');
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();

for (const folder in commandFolders) {
  const commandPath = path.join(foldersPath, commandFolders[folder]);
  const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

  for(const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);

    if('data' in command && 'execute' in command){
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property`);
    }
  }
}

client.on(Events.InteractionCreate, async interaction => {
  if(!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  
  if(!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if(interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'there was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
});

client.login(DISCORD_TOKEN);