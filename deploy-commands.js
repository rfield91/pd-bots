require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
	new SlashCommandBuilder()
        .setName('setnickname')
        .setDescription('Changes the users nickname')
		.addUserOption(option => option.setName('user').setDescription('User to change').setRequired(true))
		.addStringOption(option => option.setName('newnickname').setDescription('New Nickname').setRequired(true))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);