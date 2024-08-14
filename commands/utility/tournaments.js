const { SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token, startgg} = require('../../config');
const axios = require('axios')
let today = new Date();

module.exports = {
	data: new SlashCommandBuilder()
    .setName('tournaments')
	.setDescription('Sends a random gif!')
	.addStringOption(option =>
		option.setName('category')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoices(
				{ name: 'Week', value: 't_week' },
				{ name: 'Month', value: 't_month' },
				{ name: 'Three Months', value: 't_3month' },
			)),
	async execute(interaction) {
		const query = `
		query LeagueSchedule {
			league(slug: "tekken-world-tour-2019") {
				id
				name
				events(query: {
				page: 1,
				perPage: 3
				}) {
				pageInfo {
					totalPages
					total
				}
				nodes {
					id
					name
					startAt
					tournament {
					id
					name
					}
				}
				}
			}
		}`;

		// const variables = {
		// 	perPage: 3,
		// 	videogameIds: 287
		// };

		axios.post('https://api.start.gg/gql/alpha', {
			query: query,
		}, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': startgg
			}
		}).then(async response => {
			let events = response.data.data.league.events.nodes
			let eventName = response.data.data.league.name
			console.log(events[0].tournament);
			//console.log(response.data);
			let event_string = events.map(e => `> ${e.tournament.name}\n\n`).join('')
			await interaction.reply(`This command was run by ${interaction.user.username}, here are the events for ${eventName}:\n${event_string}`);
			// ${response.data.league.name}
		})

		
	},
};
