const Websocket = require('ws');
const axios = require('axios');
require('dotenv').config();
const _ = require('lodash');

// face detec module
require('@tensorflow/tfjs-node');
const faceapi = require('@vladmandic/face-api');
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
faceapi.nets.ssdMobilenetv1.loadFromDisk('models');

const ws = new Websocket('wss://gateway.discord.gg/');

const token = process.env.USER_TOKEN;
const userId = process.env.USER_ID;
const channelId = process.env.CHANNEL_ID;
const nickName = process.env.NICKNAME;
const serverId = process.env.GUILD_ID

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

ws.on('open', async function open() {
  ws.send(JSON.stringify(payload));
});

ws.on('message', function incoming(data) {
  let payload = JSON.parse(data);

  // https://github.com/meew0/discord-api-docs-1/blob/master/docs/topics/GATEWAY.md
  const { op, d, s, t } = payload;

  switch (op) {
    case 10:
      const { heartbeat_interval } = d;
      interval = heartBeat(heartbeat_interval);
      break;
  }

  // only effect at specify server
  if (_.get(d, 'guild_id') !== serverId) {
    return;
  }

  // image test
  const attachments = _.map(_.get(d, 'attachments'), 'url');
  for (const attachment of attachments) {
    if (!isContainFace(attachment)) {
      continue;
    }
    // Todo: connect with google drive
    console.log('save image');
  }
  // fix name if changed by others
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
  const data = JSON.stringify({ 'nick': nickName });
  const config = {
    headers: {
      'Content-Type': 'application/json ',
      'Authorization': token,
    },
  };

  await axios.patch(`https://discord.com/api/v9/guilds/${channelId}/members/@me`, data, config);
  console.log('change nickname');
}

// detect if an image contain face by its url
async function isContainFace(url) {
  const img = await canvas.loadImage(url);
  const detections = await faceapi.detectAllFaces(img);

  return detections.length > 0 ? true : false;
}
