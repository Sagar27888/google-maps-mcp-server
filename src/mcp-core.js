import { z } from 'zod';
import { ApifyClient } from 'apify-client';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const GOOGLE_MAPS_ACTOR_ID = 'techforce.global/google-maps-scraper';

export function buildServer(apifyToken) {
    const server = new McpServer({
        name: 'google-maps-mcp-server',
        version: '0.1.0',
    });

    server.tool(
        'search_google_maps',
        'Search Google Maps for businesses/places by keyword and location. Returns name, address, phone, rating, opening hours, and GPS coordinates for each result.',
        {
            searchQueries: z
                .array(z.string())
                .min(1)
                .describe('One or more search terms, e.g. "restaurants in Delhi" or "dentists in Austin TX".'),
            maxResults: z
                .number()
                .int()
                .min(1)
                .max(500)
                .optional()
                .describe('Maximum places to return per query (default 20, max 500).'),
            language: z
                .string()
                .optional()
                .describe('Language code for results, e.g. "en", "es", "fr".'),
        },
        async ({ searchQueries, maxResults, language }) => {
            const client = new ApifyClient({ token: apifyToken });

            const input = {
                searchQueries,
                maxResults: maxResults ?? 20,
                ...(language ? { language } : {}),
            };

            const run = await client.actor(GOOGLE_MAPS_ACTOR_ID).call(input);
            const { items } = await client.dataset(run.defaultDatasetId).listItems({
                limit: maxResults ?? 20,
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(items, null, 2),
                    },
                ],
            };
        },
    );

    return server;
}

export function extractBearerToken(req) {
    const header = req.headers['authorization'] || '';
    const match = /^Bearer\s+(.+)$/i.exec(header);
    return match ? match[1].trim() : null;
}
