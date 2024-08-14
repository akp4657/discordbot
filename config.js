const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    token: process.env.BOT_TOKEN,
    startgg: process.env.STARTGG_TOKEN,
}