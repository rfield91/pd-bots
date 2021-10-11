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
        const guilds = client.guilds.cache.map((guild) => guild);

        const members = await guilds[0].members.fetch();
        const options = [];

        members.forEach(member => {
            if (!member.permissions.has([Permissions.FLAGS.MANAGE_NICKNAMES, Permissions.FLAGS.CHANGE_NICKNAME])) {
                options.push({
                    label: member.nickname == null ? member.user.username : `${member.nickname} (${member.user.username})`,
                    value: member.user.id
                });
            }
        });

        options.sort((a, b) => {
            const nameA = a.label.toUpperCase();
            const nameB = b.label.toUpperCase();

            if (nameA === nameB) {
                return 0;
            }

            return nameA < nameB ? -1 : 1;
        });

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('user-select')
                    .setPlaceholder('Select User')
                    .addOptions(options)
            );

        await interaction.reply({ content: `Select a user to change to: ${interaction.options.getString('newnickname')}`, components: [row], ephemeral: true });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    const { customId } = interaction;

    if (customId === 'user-select') {
        try {
            const value = interaction.values[0];

            const guilds = client.guilds.cache.map((guild) => guild);

            const member = await guilds[0].members.fetch(value);

            await interaction.update({ content: `${member.user.username} was selected`, components: [] });

            if (!member.permissions.has([Permissions.FLAGS.MANAGE_NICKNAMES, Permissions.FLAGS.CHANGE_NICKNAME])) {
                member.setNickname(interaction.message.content.split(':')[1].trim());

                const randomResponse = randomInteger(0, responses.length - 1);

                interaction.followUp({ content: `${responses[randomResponse]} ${member}` });
            }
            else {
                interaction.followUp({ content: 'This user can not have their nickname changed.' });
            }
        }
        catch (error) {
            interaction.followUp({ content: error });
        }
    }
});

client.login(process.env.TOKEN);