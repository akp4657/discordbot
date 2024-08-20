const { SlashCommandBuilder } = require('discord.js');

// This will probably be the most complex command thus far
/**TODO
 * 1. Need to get the event per tournament. This means implementing the txt file as that will populate our options
 * 2. Once we get the event, we should either filter by player or just get the whole bracket
 * 2a. The Sets in Event call just seems to take all sets-- past and upcoming. Make sure to check the schema
 * 3. The easy part is to compile this into the Discord message
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
	},
};