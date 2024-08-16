const { SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token, startgg} = require('../../config');
const axios = require('axios')
let today = new Date();

// TODO: Possibly add text to the query? Like /tournament $stateCode?
// Definitely add text to the slash command for state. Default to null to grab the entire US
module.exports = {
	data: new SlashCommandBuilder()
    .setName('tournaments')
	.setDescription('Sends a random gif!')
	.addStringOption(option =>
		option.setName('category')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoices( 
				// TODO: Add game options. Possibly have a txt file DB in the code to keep track?
				// If it's a txt file DB, it would only be populated if the game was found in start.gg
				// This would be to avoid any "troll" names being selecatble
				{ name: 'BBCF', value: "37" },
				{ name: 'DFC:I', value: '4267' },
				{ name: 'Omega Strikers', value: '45263' },
				{ name: 'Maiden & Spell', value: '34160' },
				{ name: 'Duelists of Eden', value: '48268' },
			)),
	async execute(interaction) {
		// TODO: Use the filters accordingly
		// Filter by startDate = next day
		// The date range will be a separate commande
		// TODO: Command to show match history for a user per game.
		//let userName = interaction?.member?.nickname
		let gameValue = interaction?.options._hoistedOptions[0].value;
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
			"state": "NY"
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

			console.log(response.data)

			let gameName = gameRes.data.data.videogames.nodes[0].name;
			let events = response.data.data.tournaments.nodes
			let event_string = events.map(e => 
				`<https://www.start.gg/${e.slug}>\n\`\`\`${e.name}\`\`\`\n`
			).join('');
		
			await interaction.reply(`This command was run by ${interaction.user.globalName}, here are the upcoming events for \`\`${gameName}\`\` in ${variables.state ? variables.state : 'the US'}:\n${event_string}`);
		}).catch(err => {
			console.log(err)
		})
	},
};
