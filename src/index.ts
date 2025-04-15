#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";
import { RestServerTransport } from "@chatmcp/sdk/server/rest.js";
import { ServerMode, ServerPort, ServerEndpoint } from "./config.js";

async function main() {
  try {
    if (ServerMode === "rest") {
      const transport = new RestServerTransport({
        port: ServerPort,
        endpoint: ServerEndpoint,
      });
      await server.connect(transport);

      await transport.startServer();
    } else {
      const transport = new StdioServerTransport();
      await server.connect(transport);
    }
  } catch (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
  }
}

main();
