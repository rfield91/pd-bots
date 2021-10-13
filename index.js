require('dotenv').config();
const { Client, Intents, MessageActionRow, MessageSelectMenu, Permissions } = require('discord.js');
const { responses } = require('./responses.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.once('ready', async () => {
    console.log('Ready');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'setnickname') {
        try {
            const taggedUser = interaction.options.getMember('user');
            const newNickname = interaction.options.getString('newnickname');

            if (!taggedUser.permissions.has([Permissions.FLAGS.MANAGE_NICKNAMES, Permissions.FLAGS.CHANGE_NICKNAME])) {
                taggedUser.setNickname(newNickname);

                const randomResponse = randomInteger(0, responses.length - 1);

                interaction.reply({ content: `${responses[randomResponse]} ${taggedUser}` });
            }
            else {
                interaction.reply({ content: 'This user can not have their nickname changed.' });
            }
        }
        catch (error) {
            interaction.reply({ content: error });
        }
    }
});

client.login(process.env.TOKEN);