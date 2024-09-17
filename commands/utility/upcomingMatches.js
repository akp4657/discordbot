const { SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token, startgg} = require('../../config');
const axios = require('axios')
let today = new Date();

// TODO: Based on the bracket and user slug, find what upcoming matches the user has.
/**
 * So, we have a problem with this function now. The filter $updatedAfter is not viable as sets aren't updated
 * until they are ran on StartGG. Often, people will only update brackets after a pool is done at majors.
 * So, we need to get all sets after a specified date and filter based on displayScore == null
 * If matches are updated in GraphQL when the event starts, then we can use $updatedAfter
 * If matches are updated in GraphQL ONLY when the match is in progress, then we need to display the entire bracket
 * Unsure of how todisplay the bracket like Tourney Bot does, that repo is no longer open sourced, sadly.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('upcoming_sets')
		.setDescription("Gives a user's upcoming sets for all events. Note: All sets will be after the command is entered")
		.addStringOption(option =>
			option.setName('player')
				.setDescription("Enter player's startgg id")
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
			console.log(response.data.data.user.player)
			let playerID = response.data.data.user.player.id;
			let playerTag = response.data.data.user.player.gamerTag;

			const setQuery = `
			query Sets($playerID: ID!) {
				player(id: $playerID) {
					id
					sets(perPage: 15, page: 1) {
						nodes {
							id
							displayScore
							createdAt
							completedAt
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
				updatedAfter: Math.floor(new Date().getTime() / 1000) // It's in UNIX time.
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

			//console.log(setResponse)
			let sets = setResponse.data?.data?.player?.sets?.nodes;
			console.log(setResponse.data)
			console.log(sets)

			let setString = ''
			// sets.map(s => 
			// 	`**${s.event.tournament.name}** - *${s.event.name}*\n\`\`\`${s.displayScore}\`\`\`\n`
			// ).join('')
 
			// Example query I was using in the StartGG portal.
			// query Sets ($updatedAfter:Timestamp){
			// 	player(id: 3206822) {
			// 	  id
			// 	  sets(perPage: 25, page: 1, filters:{updatedAfter:$updatedAfter}) {
			// 		nodes {
			// 		  id
			// 		  displayScore
			// 		  slots {
			// 			id
			// 			entrant {
			// 			  id
			// 			  name
			// 			}
			// 		  }
			// 		  event {
			// 			id
			// 			name
			// 			tournament {
			// 			  id
			// 			  name
			// 			}
			// 		  }
			// 		}
			// 	  }
			// 	}
			//   }

			await interaction.reply(`Here are the upcoming sets for ${playerTag}:\n${setString}`);
		})
		
	},
};