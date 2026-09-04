import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { buildServer, extractBearerToken } from '../src/mcp-core.js';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({
            jsonrpc: '2.0',
            error: { code: -32000, message: 'Method not allowed. This endpoint only accepts POST.' },
            id: null,
        });
        return;
    }

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
}
