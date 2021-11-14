require('dotenv').config();
var log = require('loglevel');
const { Client, Intents, Permissions } = require('discord.js');
const { responses, self_namer_insults, self_name_responses } = require('./responses.json');
const util = require('util');

log.setLevel('debug'); // Set to debug to get more verbose logging

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.once('ready', async () => {
    log.info('Ready');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'setnickname') {
        try {
            const callingUser = interaction.user;
            const taggedUser = interaction.options.getMember('user');
            var newNickname = interaction.options.getString('newnickname');
            const previousNickname = taggedUser['nickname'] 

            log.debug(`Incoming request from [${callingUser['username']}]`);
            log.debug(`Attempting to change nickname of user: [${taggedUser['user']['username']}]`);
            log.debug(`From old nickname: [${previousNickname}`);
            log.debug(`To new nickname: [${newNickname}]`);

            if (newNickname.length > 32) {
                let response = `New nickname is too long. Maximum is 32 characters, \`${newNickname}\` is ${newNickname.length}`;
                log.debug(response);
                interaction.reply({ content: response, ephemeral: true });
                return;
            }

            var deservedEmoji;
            if (callingUser['id'] === taggedUser['id']) {
                log.debug('Calling user is shamefully changing their own nickname');
                const random_insult_index = randomInteger(0, self_namer_insults.length - 1);
                const emoji = self_namer_insults[random_insult_index];
                newNickname = emoji + newNickname;
                log.debug(`prepending nick with emoji, new name is ${newNickname}`);
                // We might have made the nickname too long again
                if (newNickname.length > 32) {
                    newNickname = newNickname.substring(0, 31);
                    log.debug(`oops, we made it too long, i meant ${newNickname}`);
                }
                deservedEmoji = emoji;
            }

            if (!taggedUser.permissions.has([Permissions.FLAGS.MANAGE_NICKNAMES, Permissions.FLAGS.CHANGE_NICKNAME])) {
                taggedUser.setNickname(newNickname);

                if (deservedEmoji) {
                    const randomResponseIndex = randomInteger(0, self_name_responses.length - 1);
                    const randomResponse = self_name_responses[randomResponseIndex]
                    const responseText = util.format(randomResponse, previousNickname, deservedEmoji, taggedUser)
                    interaction.reply({ content: responseText });
                } else {
                    const randomResponseIndex = randomInteger(0, responses.length - 1);
                    const randomResponse = responses[randomResponseIndex]
                    interaction.reply({ content: `${responses[randomResponse]} ${taggedUser}` });
                }
            }
            else {
                if (deservedEmoji) {
                    log.debug('An admin is trying to set their own nickname with the bot')
                    interaction.reply({ content: `The all powerful (and embarassed!) ${taggedUser} should _change their own_ nickname to \`${newNickname}\` using their discord wizard powers.` });
                } else {
                    log.debug('The tagged user cannot have their nickname changed by others, asking them politely')
                    interaction.reply({ content: `${taggedUser} needs to change their nickname to \`${newNickname}\`.` });
                }
            }
        }
        catch (error) {
            interaction.reply({ content: error });
        }
    }
});

client.login(process.env.TOKEN);