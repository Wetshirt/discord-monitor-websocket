const Websocket = require('ws');
require('dotenv').config();
const _ = require('lodash');

const isContainFace = require('./lib/face-detection');
const SaveGoogleDrive = require('./lib/google-drive');
const changeNickName = require('./lib/discord-rest');

const token = process.env.USER_TOKEN;
const userId = process.env.USER_ID;
const nickName = process.env.NICKNAME;
const serverId = process.env.GUILD_ID;

async function init() {
  const ws = new Websocket('wss://gateway.discord.gg/');
  // eslint-disable-next-line no-unused-vars
  let interval = 0;
  const payload = {
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
  };

  ws.on('open', async function open() {
    console.log('[Websocket]: Connecting!');
    ws.send(JSON.stringify(payload));
  });

  ws.on('message', async function incoming(data) {
    let payload = JSON.parse(data);

    // https://github.com/meew0/discord-api-docs-1/blob/master/docs/topics/GATEWAY.md
    const { op, d, t } = payload;

    switch (op) {
      case 10: {
        const { heartbeat_interval } = d;
        interval = heartBeat(heartbeat_interval);
        break;
      }
    }

    // only effect at specify server
    if (_.get(d, 'guild_id') !== serverId) {
      return;
    }

    // image test
    const attachments = _.map(_.get(d, 'attachments'), 'url');
    for (const attachment of attachments) {
      if (!await isContainFace(attachment)) {
        console.log('[Face Detection]: False');
        continue;
      }
      // Todo: connect with google drive
      console.log('[Face Detection]: True');
      const authorId = _.get(d, 'author.id');
      const authorName = _.get(d, 'author.username');
      SaveGoogleDrive(attachment, authorId, authorName);
    }
    
    // fix name if changed by others
    if (t === 'GUILD_MEMBER_UPDATE' && d.user.id === userId) {
      // Nick name not changed
      if (d.nick === nickName) {
        return;
      }
      // Reset nick name
      changeNickName(nickName);
    }
  });

  ws.on('close', async function close() {
    console.log('[Websocket]: Disconnected!');
    init();
  });

  // Continue connect with socket
  const heartBeat = (ms) => {
    return setInterval(() => {
      ws.send(JSON.stringify({ op: 1, d: null }));
    }, ms);
  };
}

init();
