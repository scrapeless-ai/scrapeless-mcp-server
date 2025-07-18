import http from "node:http";
import assert from "node:assert";
import crypto from "node:crypto";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer, ServerList } from "./server.js";
import { API_KEY_NAME } from "./config.js";

export async function startStdioTransport() {
  const serverList = new ServerList(async () => createMcpServer());
  const server = await serverList.create();
  await server.connect(new StdioServerTransport());
}

async function handleSSE(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  url: URL,
  sessions: Map<string, SSEServerTransport>
) {
  const serverList = createRemoteServerList(req, res);
  if (!serverList) return;

  if (req.method === "POST") {
    const sessionId = url.searchParams.get("sessionId");
    if (!sessionId) {
      res.statusCode = 400;
      return res.end("Missing sessionId");
    }

    const transport = sessions.get(sessionId);
    if (!transport) {
      res.statusCode = 404;
      return res.end("Session not found");
    }

    return await transport.handlePostMessage(req, res);
  } else if (req.method === "GET") {
    const transport = new SSEServerTransport("/sse", res);
    sessions.set(transport.sessionId, transport);

    const server = await serverList.create();
    res.on("close", () => {
      sessions.delete(transport.sessionId);
      serverList.close(server).catch((e) => {
        // eslint-disable-next-line no-console
        // console.error(e);
      });
    });
    return await server.connect(transport);
  }

  res.statusCode = 405;
  res.end("Method not allowed");
}

async function handleStreamable(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  sessions: Map<string, StreamableHTTPServerTransport>
) {
  const serverList = createRemoteServerList(req, res);
  if (!serverList) return;

  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (sessionId) {
    const transport = sessions.get(sessionId);
    if (!transport) {
      res.statusCode = 404;
      res.end("Session not found");
      return;
    }
    return await transport.handleRequest(req, res);
  }

  if (req.method === "POST") {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
      onsessioninitialized: (sessionId) => {
        sessions.set(sessionId, transport);
      },
    });
    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
    };
    const server = await serverList.create();
    await server.connect(transport);
    return await transport.handleRequest(req, res);
  }

  res.statusCode = 400;
  res.end("Invalid request");
}

export function startHttpTransport(port: number, hostname: string | undefined) {
  const sseSessions = new Map<string, SSEServerTransport>();
  const streamableSessions = new Map<string, StreamableHTTPServerTransport>();
  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(`http://localhost${req.url}`);
    if (url.pathname.startsWith("/mcp"))
      await handleStreamable(req, res, streamableSessions);
    else await handleSSE(req, res, url, sseSessions);
  });
  httpServer.listen(port, hostname, () => {
    const address = httpServer.address();
    assert(address, "Could not bind server socket");
    let url: string;
    if (typeof address === "string") {
      url = address;
    } else {
      const resolvedPort = address.port;
      let resolvedHost =
        address.family === "IPv4" ? address.address : `[${address.address}]`;
      if (resolvedHost === "0.0.0.0" || resolvedHost === "[::]")
        resolvedHost = "localhost";
      url = `http://${resolvedHost}:${resolvedPort}`;
    }
    const message = [
      `Listening on ${url}`,
      "If your client supports streamable HTTP, you can use the /mcp endpoint instead.",
    ].join("\n");
    // eslint-disable-next-line no-console
    console.log(message);
  });
}

function createRemoteServerList(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  const apiKey = req.headers[API_KEY_NAME] as string | undefined;
  if (!apiKey) {
    res.statusCode = 401;
    res.end("Unauthorized: Missing x-api-token header");
    return null;
  }
  const serverList = new ServerList(async () =>
    createMcpServer({ headers: req.headers as Record<string, string>, apiKey })
  );
  return serverList;
}
