# About 

PROJECT.Devens Discord server bots. 

# Requirements

- Node 16+
- A brain :(

# Local dev setup

## Create a version of the bot to test with
- go here https://discord.com/developers/applications and create a bot
- presumably create a personal server to test out the commands
- Invite the bot to your server with the following scopes/permissions
  - Scopes
    - bot
    - applications.commands
  - Permissions
    - View Channels
    - Change Nickname
    - Manage Nicknames
    - Send Messages
    - Manage Messages
- Hop over to 'start developing'

## Start developing
- Install node 16+ locally
- run `npm ci` to get the dependencies
- create a .env file and populate it with properities found on the bot's discord application management page 
```
CLIENT_ID=<This value is found under CLIENT ID in the 'OAuth2' section>
TOKEN=<This value is found under TOKEN in the 'Bot' section>
```
- run the deploy-commands.js script to inform discord what commands we support `node deploy-commands.js`. If you get a success from this you apparently need to wait for an hour for it to take effect
- Run `node index.js` to actually run the service for the bot. This must be running for the bot to function.

# Included Commands

## Set Nickname

Provides the ability for users to update other users nicknames.

```/setnickname newnickname```
