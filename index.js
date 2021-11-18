require('dotenv').config();
let log = require('loglevel');
const { Client, Intents, Permissions } = require('discord.js');
const { other_name_responses, self_name_responses } = require('./responses.json');
const { self_namer_names } = require('./names.json');
const util = require('util');
var emojiStrip = require('emoji-strip')

log.setLevel('info'); // Set to debug to get more verbose logging

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Gets a random entry from the passed list
function getRandomEntry(list) {
    let randomResponseIndex = randomInteger(0, list.length - 1);
    return list[randomResponseIndex];
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

            const currentServerNicknames = (await interaction.member.guild.members.fetch()).map((m) => m.displayName);
            log.debug("Current nicknames in use on server:");
            log.debug(currentServerNicknames);

            newNickname = emojiStrip(newNickname);
            log.debug(`newNickname after stripping emoji: [${newNickname}]`);

            if (newNickname.length > 32) {
                let response = `New nickname is too long. Maximum is 32 characters, \`${newNickname}\` is ${newNickname.length}`;
                log.debug(response);
                interaction.reply({ content: response, ephemeral: true });
                return;
            }

            if (currentServerNicknames.includes(newNickname)) {
                let response = `New nickname \`${newNickname}\` is already in use, pick something else!`
                log.debug(response);
                interaction.reply({ content: response, ephemeral: true });
                return;
            }

            let settingOwnName = callingUser['id'] === taggedUser['id'];
            log.debug(`setting own name: [${settingOwnName}]`)
            let userHasNicknamePermissions = taggedUser.permissions.has([Permissions.FLAGS.MANAGE_NICKNAMES, Permissions.FLAGS.CHANGE_NICKNAME])
            log.debug(`user has nickname permissions: [${userHasNicknamePermissions}]`)

            if (!userHasNicknamePermissions) {
                let responseText;
                
                if (settingOwnName) {
                    // Don't let the randomly picked name be one someone else currently has
                    let potentialNames = self_namer_names.filter((name) => !channelNicknames.includes(name))

                    let intendedName = newNickname;
                    newNickname = getRandomEntry(potentialNames);
                    log.debug(`Intended name [${intendedName}] will be swapped for new name: [${newNickname}]`)
                    responseText = util.format(getRandomEntry(self_name_responses), previousNickname, intendedName, taggedUser);
                } else {
                    responseText = util.format(getRandomEntry(other_name_responses), previousNickname, taggedUser);
                }

                log.debug(`setting nick for [${previousNickname}] to [${newNickname}]`);
                taggedUser.setNickname(newNickname);

                log.debug(`responseText = [${responseText}]`);
                interaction.reply({ content: responseText });
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