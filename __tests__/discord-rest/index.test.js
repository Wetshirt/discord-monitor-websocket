require('dotenv').config();
const WebSocket = require('ws');
const axios = require('axios');
const _ = require('lodash');
const { changeNickName, reactEmoji } = require('../../lib/discord-rest');

const token = process.env.USER_TOKEN;
const serverId = process.env.GUILD_ID;
const channelId = process.env.CHANNEL_ID;
const config = {
  headers: {
    'Content-Type': 'application/json ',
    'Authorization': token,
  },
};

async function getNickName() {
  const data = await axios.get(`https://discord.com/api/v9/users/@me/guilds/${serverId}/member`, config);
  return data;
}

async function createMessage(message) {
  const params = {
    content: message
  };
  const data = await axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, params, config);
  return data;
}

async function getMessages(messageId) {
  const data = await axios.get(`https://discord.com/api/v9/channels/${channelId}/messages`, config);
  return data;
}

describe('test discord api', () => {
  it('change user name', async () => {
    const testNickName = 'test name';
    await changeNickName(testNickName);
    const NickName = _.get(await getNickName(), 'data.nick');
    expect(NickName).toBe(testNickName);
  });

  it('react emoji', async () => {
    const testMsg = 'Unit Test Message!';
    const testEmoji = '👎';
    // create message
    const msgId = _.get(await createMessage(testMsg), 'data.id');
    await reactEmoji(channelId, msgId, testEmoji);
    const reaction = _.get(await getMessages(msgId), 'data[0].reactions[0].emoji.name');
    expect(reaction).toBe(testEmoji);
  });
});
