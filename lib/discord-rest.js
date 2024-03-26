require('dotenv').config();
const axios = require('axios');

const token = process.env.USER_TOKEN;
const serverId = process.env.GUILD_ID;

// Set Nick Name
async function changeNickName(nickName) {
  const data = JSON.stringify({ 'nick': nickName });
  const config = {
    headers: {
      'Content-Type': 'application/json ',
      'Authorization': token,
    },
  };

  await axios.patch(`https://discord.com/api/v9/guilds/${serverId}/members/@me`, data, config);
  console.log('[Discord Rest]: Change Nickname!');
}

module.exports = changeNickName;
