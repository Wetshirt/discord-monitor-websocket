require('dotenv').config();
const axios = require('axios');

const token = process.env.USER_TOKEN;
const serverId = process.env.GUILD_ID;
const config = {
  headers: {
    'Content-Type': 'application/json ',
    'Authorization': token,
  },
};

// Set Nick Name
async function changeNickName(nickName) {
  const data = JSON.stringify({ 'nick': nickName });
  await axios.patch(`https://discord.com/api/v9/guilds/${serverId}/members/@me`, data, config);
  console.log('[Discord Rest]: Change Nickname!');
}

// React Emiji
async function reactEmoji(channelId, messageId, emoji) {
  await axios.put(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, {}, config);
  console.log('[Discord Rest]: React Emoji:', emoji);
}

module.exports = { changeNickName, reactEmoji };
