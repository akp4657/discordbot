const { SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token, startgg} = require('../../config');
const axios = require('axios')
const fs = require('fs');
const path = require('path');
let today = new Date();

// Reading the file to create an array of the game objects
// There's some type of error/race condition happening where the value becomes undefined when
// the build is made. Need to look into this tomorrow/Friday
const baseDir = path.dirname(require.main.filename); // Move up to the base directory
const filePath = path.join(baseDir, 'games.txt');
const fileContents = fs.readFileSync(filePath, 'utf8');
let gamesString = fileContents.trim().split('|');
gamesString.pop();

let json = gamesString.map(gs => JSON.parse(gs))

console.log(json)
let finalGames = json.map(j => ({
	name: j.name,
	value: j.id
}));

console.log(finalGames)
module.exports = {
	data: new SlashCommandBuilder()
    .setName('tournaments')
	.setDescription('Sends a random gif!')
	.addStringOption(option =>
		option.setName('game')
			.setDescription('Select a game')
			.setRequired(true)
			.addChoices( 
				// DOME: Add game options. Possibly have a txt file DB in the code to keep track?
				// If it's a txt file DB, it would only be populated if the game was found in start.gg
				// This would be to avoid any "troll" names being selecatble
				// ^ This has been done. Now we need to populate the options with the file name
				{ name: 'BBCF', value: "37" },
				{ name: 'DFC:I', value: '4267' },
				{ name: 'Omega Strikers', value: '45263' },
				{ name: 'Maiden & Spell', value: '34160' },
				{ name: 'Duelists of Eden', value: '48268' },
			))
	.addStringOption(option =>
		option.setName('state')
			.setDescription('Enter state code (eg: NY) or leave blank for US')
			.setRequired(false)),
	async execute(interaction) {
		// TODO: Use the filters accordingly
		// Filter by startDate = next day
		// The date range will be a separate commande
		// TODO: Command to show match history for a user per game.
		//let userName = interaction?.member?.nickname
		let gameValue = interaction?.options._hoistedOptions[0]?.value;
		let stateCode = interaction?.options._hoistedOptions[1]?.value;
		console.log(stateCode)
		const query = ` 
		query TournamentsByVideogame($perPage: Int!, $videogameId: ID!, $countryCode: String, $state: String) {
			tournaments(query: {
				perPage: $perPage
				page: 1
				sortBy: "startAt asc"
				filter: {
					upcoming: true
					videogameIds: [
						$videogameId
					],
					countryCode: $countryCode,
					addrState: $state
				}
			}) {
				nodes {
					id
					name
					slug
				}
			}
		},`;

		const variables = {
			"perPage": 10,
			"videogameId": +gameValue,
			"countryCode": "US",
			"state": stateCode
		};

		axios.post('https://api.start.gg/gql/alpha', {
			query: query,
			variables: variables
		}, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': startgg
			}
		}).then(async response => {

			// Start.gg doesn't return the name of the choices in the interaction. 
			// Probably before the txt file is implemented
			const gameQuery = `query VideogameQuery ($videogameId: ID) {
				videogames(query: { filter: { id: [$videogameId] }, perPage: 5 }) {
					nodes {
						id
						name
					}
				}
			}`
			
			const gameVariables = { videogameId: gameValue }

			let gameRes = await axios.post('https://api.start.gg/gql/alpha', {
				query: gameQuery,
				variables: gameVariables
			}, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': startgg
				}
			})

			let gameName = gameRes.data.data.videogames.nodes[0].name;
			let events = response.data.data.tournaments.nodes
			let event_string = events.map(e => 
				`<https://www.start.gg/${e.slug}>\n\`\`\`${e.name}\`\`\`\n`
			).join('');
		
			await interaction.reply(`This command was run by ${interaction.user.globalName}, here are the upcoming events for \`\`${gameName}\`\` in ${stateCode ? stateCode : 'the US'}:\n${event_string}`);
		}).catch(err => {
			console.log(err)
		})
	},
};
