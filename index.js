require('dotenv').config();
let log = require('loglevel');
const { Client, Intents, Permissions } = require('discord.js');
const { responses, self_namer_insults, self_name_responses } = require('./responses.json');
const util = require('util');
var emojiStrip = require('emoji-strip')

log.setLevel('info'); // Set to debug to get more verbose logging

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
            let newNickname = interaction.options.getString('newnickname');
            const previousNickname = taggedUser['nickname'] 

            log.debug(`Incoming request from [${callingUser['username']}]`);
            log.debug(`Attempting to change nickname of user: [${taggedUser['user']['username']}]`);
            log.debug(`From old nickname: [${previousNickname}]`);
            log.debug(`To new nickname: [${newNickname}]`);

            newNickname = emojiStrip(newNickname);
            log.debug(`After stripping emoji: [${newNickname}]`);

            if (newNickname.length > 32) {
                let response = `New nickname is too long. Maximum is 32 characters, \`${newNickname}\` is ${newNickname.length}`;
                log.debug(response);
                interaction.reply({ content: response, ephemeral: true });
                return;
            }

            let settingOwnName = callingUser['id'] === taggedUser['id'];
  
            if (!taggedUser.permissions.has([Permissions.FLAGS.MANAGE_NICKNAMES, Permissions.FLAGS.CHANGE_NICKNAME])) {
                taggedUser.setNickname(newNickname);

                if (settingOwnName) {
                    const randomResponseIndex = randomInteger(0, self_name_responses.length - 1);
                    const randomResponse = self_name_responses[randomResponseIndex];
                    const responseText = util.format(randomResponse, previousNickname, taggedUser);
                    interaction.reply({ content: responseText });
                } else {
                    const randomResponseIndex = randomInteger(0, responses.length - 1);
                    const randomResponse = responses[randomResponseIndex];
                    const responseText = util.format(randomResponse, previousNickname, taggedUser);
                    interaction.reply({ content: responseText });
                }
            }
            else {
                log.debug('The tagged user cannot have their nickname changed by others, asking them politely')
                interaction.reply({ content: `Could ${taggedUser} please change their nickname to \`${newNickname}\`?` });
            }
        }
        catch (error) {
            interaction.reply({ content: error });
        }
    }
});

client.login(process.env.TOKEN);