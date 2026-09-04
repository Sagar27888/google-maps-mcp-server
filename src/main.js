import express from 'express';
import { z } from 'zod';
import { ApifyClient } from 'apify-client';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const GOOGLE_MAPS_ACTOR_ID = 'techforce.global/google-maps-scraper';

function buildServer(apifyToken) {
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

function extractBearerToken(req) {
    const header = req.headers['authorization'] || '';
    const match = /^Bearer\s+(.+)$/i.exec(header);
    return match ? match[1].trim() : null;
}

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
    const token = extractBearerToken(req);

    if (!token) {
        res.status(401).json({
            jsonrpc: '2.0',
            error: {
                code: -32001,
                message: 'Missing Apify API token. Pass your own token as: Authorization: Bearer <APIFY_TOKEN>',
            },
            id: null,
        });
        return;
    }

    try {
        const server = buildServer(token);
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

        res.on('close', () => {
            transport.close();
            server.close();
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (err) {
        console.error('MCP request failed:', err);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: { code: -32603, message: 'Internal server error' },
                id: null,
            });
        }
    }
});

app.get('/mcp', (_req, res) => {
    res.status(405).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed. This endpoint only accepts POST.' },
        id: null,
    });
});

app.get('/', (_req, res) => {
    res.status(200).send('Google Maps MCP Server is running. POST to /mcp with an Authorization: Bearer <APIFY_TOKEN> header.');
});

const port = process.env.ACTOR_STANDBY_PORT || process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Google Maps MCP Server listening on port ${port}. Endpoint: /mcp`);
});
