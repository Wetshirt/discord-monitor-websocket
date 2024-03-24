# discord-monitor-websocket
subscribe specify events in discord

- nickname changed by others will reset
- store image to google drive which contain human

# Init 
`yarn install`

# Config
create .env under root folder and config with those variable.

```
CHANNEL_ID=<Specify-Channel-Id>
USER_ID=<Discord-User-Id>
USER_TOKEN=<Discord-Token>
NICKNAME=<Nickname>
GUILD_ID=<Discord-Server-Id>
DRIVE_FOLDER_ID=<Google-Drive-Folder>
```

## Google Drive
1. enable google drive api
2. create service account
3. download credentials and save to serviceAccountKey.json
4. allow sercice account can access upload folder

# Run
`node .`

# Reference
- [Websocket](https://youtu.be/uo7ugT_XQKk)
- [Gateway](https://discord.com/developers/docs/topics/gateway)
- [discord-api-docs-1](https://github.com/meew0/discord-api-docs-1/tree/master)
