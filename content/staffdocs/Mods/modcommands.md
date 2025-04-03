---
title: 'Commands'
position: 5
---

::card
## Chat Moderation Commands
Command | Aliases | Description
--- | --- | ---
`/clearchat` | `/cc`, `/chatclear` | Clears the chat for all players except those with `carbon.chearchat.exempt`.
`/join <channel>` | None | Joins available channels.
`/leave <channel>` | None | Leaves joined channels.
`/ignore <player>` | `/block` | Hides all chat messages and whispers from the specified player.
`/unignore <player>` | `/unblock` | Removes a player from the sender's ignore list.
`/ignorelist <page>` | `/listignores` | Shows list of ignored users.
`/spy` | None | Allows a player to view all private and channel messages they otherwise wouldn't see.
`/mute <player>` | None | Mutes a player, preventing them from sending messages or whispers.
`/unmute <player>` | None | `carbon.mute.unmute` | Unmutes a player, allowing them to use chat and send whispers.
`/muteinfo <player>` | `/muted` | Shows if a player is muted or not.
`/nickname <player>` | `/nick` | Shows a player's nickname.
`/nickname --player` | `/nick` | Checks/sets other players' nicknames.
`/nickname --nickname` | `/nick` | Sets your/other players' nicknames.
`/nickname --reset` | `/nick` | Resets your/other players' nicknames.
`/updateusername <player>` | `/updatename` | Updates your/other players' username by fetching profile data again.
`/filter` | None | Toggles defined optional chat filter. See here(Basic-Configuration#optional-chat-filter) for info.
`/reply` | `/r` | Sends a message to the last player who messaged you.
`/continue` | `/c` | Sends a message to the last player whispered.
`/whisper <player>` | `/w`, `message`, `msg`, `m`, `tell` | Sends a private message to another player.
`/togglemsg` | `/togglepm` | Hides/shows incoming private messages.

\
`<player>` in `/ignore`, `/unignore`, `/mute`, `/unmute`, `/muteinfo` and `/updateusername` can be replaced with UUID if the `-u` or `--uuid` flag is used. Example: `/mute --uuid f84c6a79-44e4-4d98-8ca7-7d6dd8bb3c64`.
## Server Moderation Commands
Command | Description
--- | ---
`/ban <player> <reason>` | Bans a player with or without reason
`/ban-ip <player> <reason>` | IP-Bans a player with out without reason
`/unban <player> ` | Unbans player
`/kick <type> <player/IP/server> <reason>` | Kicks a player with or without reason (Type refers to byIP, byName, or byServer)
`/banlist <type>` | Shows a list of banned players or IPs
`/ban <player> <reason>` | Bans a player with or without reason

::