# Google Maps MCP Server

A standalone [Model Context Protocol](https://modelcontextprotocol.io) server that exposes
Google Maps business search as a single MCP tool, backed by Techforce Global's
[Google Maps Scraper](https://apify.com/techforce.global/google-maps-scraper) Apify Actor.

## Tool

### `search_google_maps`

Search Google Maps for businesses/places by keyword and location.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `searchQueries` | string[] | yes | One or more search terms, e.g. `"restaurants in Delhi"` |
| `maxResults` | integer | no | Max places per query (default 20, max 500) |
| `language` | string | no | Language code for results, e.g. `"en"` |

Returns structured JSON: business name, address, phone, rating, opening hours, and GPS coordinates.

## Authentication

Every request must include your own Apify API token:

```
Authorization: Bearer <YOUR_APIFY_TOKEN>
```

Usage is billed to the token owner's Apify account, not to Techforce Global.
Get your token at [Apify Console → Settings → Integrations](https://console.apify.com/account/integrations).

## Installation

### Hosted (recommended)

Connect directly to the hosted Standby endpoint — no install required:

```
https://google-maps-mcp-server.techforce-global.apify.actor/mcp
```

Example client config (Claude Desktop / any MCP client supporting Streamable HTTP):

```json
{
  "mcpServers": {
    "google-maps": {
      "url": "https://google-maps-mcp-server.techforce-global.apify.actor/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_APIFY_TOKEN>"
      }
    }
  }
}
```

### Run locally

```bash
npm install
npm start
```

Server listens on `http://localhost:4000/mcp`.

## Deploying on Apify

This project is an Apify Actor configured for [Standby mode](https://docs.apify.com/platform/actors/running/standby),
which turns it into a long-running HTTP service instead of a one-shot batch job.

1. Push this project to an Actor on your Apify account (Apify Console → Actors → Create new → connect this
   source, or use the Apify CLI: `apify push`).
2. In the Actor's **Settings → Standby**, enable Standby mode.
3. The public endpoint becomes available at `https://<actor-name>.<your-apify-username>.apify.actor/mcp`.

## License

MIT
