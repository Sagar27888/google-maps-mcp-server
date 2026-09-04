import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { buildServer, extractBearerToken } from './mcp-core.js';

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
    const token = extractBearerToken(req);

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
