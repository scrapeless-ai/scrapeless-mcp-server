import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ScrapelessClient } from "@scrapeless-ai/sdk";
import { SCRAPELESS_CONFIG, API_KEY } from "./config.js";
import * as toolsList from "./tools/index.js";
import * as browserTools from "./tools/browser/browser.js";
import { ContextManager } from "./context-manager.js";

export const serverOptions = {
  name: "scrapeless-mcp-server",
  version: "0.2.0",
  capabilities: { resources: {}, tools: {} },
};

export const createMcpServer = (options?: {
  headers?: Record<string, string>;
  apiKey?: string;
}) => {
  const server = new McpServer(serverOptions);
  initMcpTools(server, options?.headers, options?.apiKey);
  return server.server;
};

export const initMcpTools = (
  server: McpServer,
  headers?: Record<string, string>,
  apiKey?: string
) => {
  const getScrapelessClient = () => {
    if (apiKey) {
      return new ScrapelessClient({
        apiKey: apiKey,
        baseApiUrl: SCRAPELESS_CONFIG.baseApiUrl,
      });
    }
    // Fallback for Stdio mode or when no API key is provided
    return new ScrapelessClient(SCRAPELESS_CONFIG);
  };

  // tools registration
  Object.values(toolsList).forEach((tool) => {
    server.tool(tool.name, tool.description, tool.inputSchema, (params: any) =>
      tool.handle(params, getScrapelessClient())
    );
  });

  const context = ContextManager.getInstance().getContext(apiKey ?? API_KEY);

  Object.values(browserTools).forEach((tool) => {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema,
      async (params: any) => {
        const result = await context.run(tool, params, headers);
        return result;
      }
    );
  });
};

export class ServerList {
  private _servers: Server[] = [];
  private _serverFactory: () => Promise<Server>;

  constructor(serverFactory: () => Promise<Server>) {
    this._serverFactory = serverFactory;
  }

  async create() {
    const server = await this._serverFactory();
    this._servers.push(server);
    return server;
  }

  async close(server: Server) {
    const index = this._servers.indexOf(server);
    if (index !== -1) this._servers.splice(index, 1);
    await server.close();
  }

  async closeAll() {
    await Promise.all(this._servers.map((server) => server.close()));
  }
}
