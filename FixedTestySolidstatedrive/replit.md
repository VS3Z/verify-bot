# South Group – Discord Verify Bot

A Discord.js v14 verification bot for the **South Group** server.

## Features
- Sends a styled Arabic embed with server icon and a **Verify** button
- Checks account age (must be ≥ 30 days)
- Rejects bots automatically
- Optionally grants a verified role on success
- All responses are ephemeral (only visible to the user)

## Setup Steps
1. Add secrets: `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `VERIFIED_ROLE_ID`
2. Run **Deploy Commands** workflow once to register `/setup-verify`
3. Run **Start Bot** workflow to keep the bot online
4. Use `/setup-verify` in your verification channel

## Commands
| Command | Description |
|---|---|
| `/setup-verify` | Sends the verification embed (Admin only) |

## User Preferences
- Language: Arabic / English mixed
- Bot name context: South Group community
