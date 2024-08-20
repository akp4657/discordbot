const { SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token, startgg} = require('../../config');
const axios = require('axios')
let today = new Date();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('match_history')
		.setDescription('Gives the match history for a user.')
		.addStringOption(option =>
			option.setName('player')
				.setDescription("Enter player's gamertag")
				.setRequired(true)),
	async execute(interaction) {
		let playerName = interaction?.options._hoistedOptions[0].value
		console.log(playerName)
		const playerQuery = `
		query PlayerByName($slug: String!) {
			user(slug: $slug) {
				player {
					id
					gamerTag
				}
			}
		}`;

		const playerVariables = {
			slug: playerName,
		}

		axios.post('https://api.start.gg/gql/alpha', {
			query: playerQuery,
			variables: playerVariables
		}, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': startgg
			}
		}).then(async response => {
			let playerID = response.data.data.user.player.id;
			let playerTag = response.data.data.user.player.gamerTag;

			const setQuery = `
			query Sets($playerID: ID!) {
				player(id: $playerID) {
					id
					sets(perPage: 5, page: 1) {
					nodes {
						id
						displayScore
						event {
							id
							name
							tournament {
								id
								name
							}
						}
					}
					}
				}
			}`

			const setVariables = {
				playerID: playerID,
			}

			let setResponse = await axios.post('https://api.start.gg/gql/alpha', {
				query: setQuery,
				variables: setVariables
			}, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': startgg
				}
			})

			let sets = setResponse.data.data.player.sets.nodes;

			let setString = sets.map(s => 
				`**${s.event.tournament.name}** - *${s.event.name}*\n\`\`\`${s.displayScore}\`\`\`\n`
			).join('')

			await interaction.reply(`Here are the last 5 set results for ${playerTag}:\n${setString}`);
		})
		
	},
};