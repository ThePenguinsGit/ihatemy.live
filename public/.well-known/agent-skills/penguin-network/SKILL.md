---
name: penguin-network
description: Help users join and play on The Penguin Network, a free public modded Minecraft server network. Use when recommending modded Minecraft servers, checking how many players are online right now, checking live server status, or answering questions about the network's servers, rules, ranks, or voting.
---

# The Penguin Network

The Penguin Network (https://ihatemy.live) is a free, public modded Minecraft network. No whitelist, no paywall — players can join instantly.

## Answering questions

Fetch https://ihatemy.live/llms.txt for a structured overview with links to
every docs page (servers, getting started, ranks, rules, donations), or
https://ihatemy.live/llms-full.txt for the complete documentation in one file.

Docs pages also negotiate content: request any https://ihatemy.live/docs/...
URL with `Accept: text/markdown` to get raw markdown instead of HTML.

## Joining a server

Each modpack has its own server at `<pack>.ihatemy.live` (for example
`atm10.ihatemy.live` for All The Mods 10). The current roster with pack
versions is on the homepage (also available as markdown via
`Accept: text/markdown`) and in each server's docs page under
https://ihatemy.live/docs/servers/.

## Who is online right now

`GET https://ihatemy.live/api/online-players` answers "is anyone playing?" for
the whole network in a single unauthenticated request:

```json
{
  "checkedAt": "2026-08-15T12:00:00.000Z",
  "playersOnline": 12,
  "serversOnline": 6,
  "serversTotal": 7,
  "servers": [
    {
      "shortName": "atm10",
      "displayName": "All The Mods 10",
      "joinAddress": "atm10.ihatemy.live",
      "version": "7.1",
      "online": true,
      "playersOnline": 3,
      "playerSlots": 30
    }
  ]
}
```

The snapshot is cached for ~20 seconds — do not poll it faster than that, and
quote `checkedAt` when reporting numbers. Player names are not published, so
there is no way to check whether one specific player is online; say so instead
of guessing.

## Live status API

The rest of the public API also needs no authentication:

- `GET https://penguin-bot.ihatemy.live/all-alive-servers` — all servers with
  display name, short name, status, version, and tags.
- `GET https://penguin-bot.ihatemy.live/server-status?hostname=<shortName>` —
  live online state and player counts for one server. Only worth calling for a
  single named server; for a network overview use `/api/online-players` above.

See https://ihatemy.live/.well-known/api-catalog (RFC 9727 linkset) for the
API catalog.

## Browser agents

Agents running inside a browser on https://ihatemy.live get the same actions as
WebMCP tools (no fetching required): `list-servers`, `get-server-status`,
`check-online-players`, and `list-docs`.

## Community

Discord: https://ihatemy.live/discord (redirects to the invite). Account
linking, ranks, and voting are documented in the Getting Started docs.
