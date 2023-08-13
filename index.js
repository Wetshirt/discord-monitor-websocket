const Websocket = require('ws');
const axios = require('axios');
require('dotenv').config();

// keep our service alive
require('./keep_alive.js');

const ws = new Websocket('wss://gateway.discord.gg/');

const token = process.env.USER_TOKEN;
const userId = process.env.USER_ID;
const channelId = process.env.CHANNEL_ID;
const nickName = process.env.NICKNAME;

let interval = 0;
payload = {
	op: 2,
	d: {
		token: token,
		intents: 513,
		properties: {
			$os: 'linux',
			$browser: 'chrome',
			$device: 'chrome',
		}
	}
}

ws.on('open', function open() {
	ws.send(JSON.stringify(payload));
});

ws.on('message', function incoming(data) {
	let payload = JSON.parse(data);

	console.log(payload);
	// https://github.com/meew0/discord-api-docs-1/blob/master/docs/topics/GATEWAY.md
	const { op, d, s, t } = payload;

	switch (op) {
		case 10:
			const { heartbeat_interval } = d;
			interval = heartBeat(heartbeat_interval);
			break;
	}

	if (t === 'GUILD_MEMBER_UPDATE' && d.user.id === userId) {
		// Nick name not changed
		if (d.nick === nickName) {
			return;
		}

		// Reset nick name
		changeNickName(channelId, nickName);
	}
});

// Continue connect with socket
const heartBeat = (ms) => {
	return setInterval(() => {
		ws.send(JSON.stringify({ op: 1, d: null }));
	}, ms);
}

// Set Nick Name
async function changeNickName(channelId, nickName) {
  const data = JSON.stringify({'nick': nickName});
  const config = {
    headers: {
      'Content-Type': 'application/json ',
      'Authorization': token,
    },
  };

  await axios.patch(`https://discord.com/api/v9/guilds/${channelId}/members/@me`, data, config);
  console.log('change nickname');
}
