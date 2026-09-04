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

Connect directly to the hosted endpoint — no install required:

```
https://<your-vercel-project>.vercel.app/mcp
```

Example client config (Claude Desktop / any MCP client supporting Streamable HTTP):

```json
{
  "mcpServers": {
    "google-maps": {
      "url": "https://<your-vercel-project>.vercel.app/mcp",
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

## Deploying on Vercel (free)

This project includes a serverless entry point (`api/mcp.js`) and a `vercel.json` rewrite so the
public endpoint is available at a clean `/mcp` path.

1. Go to [vercel.com](https://vercel.com), sign in, click **Add New → Project**.
2. Import this GitHub repo (`Sagar27888/google-maps-mcp-server`).
3. Framework preset: **Other**. No build command needed — Vercel auto-detects the `api/` folder.
4. Click **Deploy**.
5. The public endpoint becomes available at `https://<your-vercel-project>.vercel.app/mcp`.

## Deploying on Apify (alternative)

This project is also an Apify Actor configured for [Standby mode](https://docs.apify.com/platform/actors/running/standby),
which turns it into a long-running HTTP service instead of a one-shot batch job.

1. Push this project to an Actor on your Apify account (Apify Console → Actors → Create new → connect this
   source, or use the Apify CLI: `apify push`).
2. In the Actor's **Settings → Standby**, enable Standby mode.
3. The public endpoint becomes available at `https://<actor-name>.<your-apify-username>.apify.actor/mcp`.

## License

MIT
