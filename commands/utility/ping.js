const { SlashCommandBuilder } = require('discord.js');

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
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
	},
};
