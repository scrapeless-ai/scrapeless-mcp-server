import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { initMcpTools, serverOptions } from "./server.js";
import { API_KEY_NAME } from "./config.js";

type Props = { apiKey: string, headers: any };
type Env = any
type State = null;
type ExecutionContext = any

export class CfMcpServer extends McpAgent<Env, State, Props> {
  server = new McpServer(serverOptions);

  async init() {
    initMcpTools(this.server, this.props.headers, this.props.apiKey)
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const apiKeyHeader = request.headers.get(API_KEY_NAME);
    if (!apiKeyHeader) {
      return new Response(`Unauthorized: Missing ${API_KEY_NAME} header`, { status: 401 });
    }

    ctx.props = { apiKey: apiKeyHeader, headers: request.headers };

    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return CfMcpServer.serveSSE("/sse").fetch(request, env, ctx);
    }

    if (url.pathname === "/mcp") {
      return CfMcpServer.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
