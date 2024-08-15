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
				{ name: 'Week', value: 't_week' },
				{ name: 'Month', value: 't_month' },
				{ name: 'Three Months', value: 't_3month' },
			)),
	async execute(interaction) {
		// TODO: Use the filters accordingly
		// Filter by startDate = next day
		const query = ` 
		query TournamentsByVideogames($perPage: Int, $videogameIds: [ID], $countryCode: String, $state: String) {
			tournaments(query: {
				perPage: $perPage
				page: 1
				sortBy: "startAt asc"
				filter: {
					upcoming: true
					videogameIds: $videogameIds
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
		}`;

		const variables = {
			"perPage": 10,
			"videogameIds": [37, 4267, 45263, 34168, 48268],
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
			let events = response.data.data.tournaments.nodes
			let event_string = events.map(e => 
				`<https://www.start.gg/${e.slug}>\n\`\`\`${e.name}\`\`\`\n`
			).join('');
		
			await interaction.reply(`This command was run by ${interaction.user.username}, here are the events for your games in ${variables.state}:\n${event_string}`);
		}).catch(err => {
			console.log(err)
		})
	},
};
