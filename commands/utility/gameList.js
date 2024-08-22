const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle  } = require('discord.js');
const { clientId, guildId, token, startgg} = require('../../config');
const paginationEmbed = require('discordjs-v14-pagination');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/***
 * TODO:
 * 1. Add a game list command
 * 2. We need to add a way to remove games. Or at least take a game from the top when we reach the max number of games
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('game-list')
		.setDescription('See what games I have in my list!'),
	async execute(interaction) {
        try{
            // Note: I need to comment every interaction on filestream because I'm still iffy on it
            // Define the file path
            const baseDir = path.dirname(require.main.filename); // Move up to the base directory
            const filePath = path.join(baseDir, 'games.txt');

            // Write the string to the file
            const fileContents = fs.readFileSync(filePath, 'utf8');
            let jsonArray = fileContents.trim().split('|'); // Create an array without the breaks
            jsonArray.pop(); // The last element is an empty string.
            
            let json = jsonArray.map(js => JSON.parse(js))
            let gameArray = json.map(j => j.name);

            let arrayChunk = function(array, size) {
                let chks = [];
                
                // Chunk out every 10 games in the list
                // https://stackoverflow.com/questions/8495687/split-array-into-chunks
                for(let i = 0; i < array.length; i += size) {
                    chks.push(array.slice(i, i + size))
                }
                return chks;
            }

            let chunks = arrayChunk(gameArray, 5)

            // Create an array of embeds with the chunks
            let embeds = chunks.map((c, i) => {
                return new EmbedBuilder()
                    .setTitle(`Games List - Page ${i + 1}`)
                    .setDescription(c.join('\n'))
            })

            // https://github.com/JavascriptSimp/discordjs-v14-pagination
            const previousPageButton = new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('1029435199462834207')
                .setStyle(ButtonStyle.Primary);

            const nextPageButton = new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('1029435213157240892')
                .setStyle(ButtonStyle.Primary);
                const buttons = [ previousPageButton, nextPageButton ];
    
            paginationEmbed(
                interaction, // The interaction object
                embeds, // Your array of embeds
                buttons, // Your array of buttons
                180000, // (Optional) The timeout for the embed in ms
            );

        } catch(err) {
            console.log(err)
            await interaction.reply(`There was an error getting the game list. Sorry about that!`);
        }
        
	},
};