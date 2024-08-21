const { SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token, startgg} = require('../../config');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/***
 * TODO:
 * 1. Add a game list command
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-game')
		.setDescription('Add a game to choose from in the command /tournaments.')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Please input the full official name. There are a lot of games.')
                .setRequired(true)),
	async execute(interaction) {
        let gameName = interaction?.options._hoistedOptions[0]?.value
        const gameQuery = `query VideogameQuery ($name: String!) {
            videogames(query: { filter: { name: $name }, perPage: 5 }) {
                nodes {
                    id
                    name
                }
            }
        }`
        
        const gameVariables = { name: gameName }

        let gameRes = await axios.post('https://api.start.gg/gql/alpha', {
            query: gameQuery,
            variables: gameVariables
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': startgg
            }
        })

        let games = gameRes.data.data.videogames.nodes

        try{
            // We need to change the class of the name to a String(?) and then compare that to the user input
            let filteredGame = games.filter(g => String(g.name).toLowerCase().includes(gameName.toLowerCase()))[0]
            const newGameString = `{ name: ${filteredGame.name}, value: "${filteredGame.id}" }\n`

            // Note: I need to comment every interaction on filestream because I'm still iffy on it
            // Define the file path
            const baseDir = path.dirname(require.main.filename); // Move up to the base directory
            const filePath = path.join(baseDir, 'games.txt');

            // Write the string to the file
            fs.appendFileSync(filePath, newGameString + '\n', 'utf8');

            await interaction.reply(`\`\`${filteredGame.name}\`\` has been added to my list.`);
        } catch(err) {
            console.log(err)
            await interaction.reply(`I couldn't find \`\`${gameName}\`\`. Could you try a different name?`);
        }
        
	},
};