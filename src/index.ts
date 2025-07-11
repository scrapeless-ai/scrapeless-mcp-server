#!/usr/bin/env node
import { ServerPort, API_KEY, ServerHostname } from "./config.js";
import { startHttpTransport, startStdioTransport } from "./transport.js";

process.env.SCRAPELESS_IS_ONLINE = "true";

async function main() {
  try {
    if (ServerPort) {
      // See use the /see endpoint
      // Streamable HTTP use the /mcp endpoint
      startHttpTransport(Number(ServerPort), ServerHostname);
    } else {
      if (!API_KEY)
        throw new Error("❌ Missing environment variable: SCRAPELESS_KEY");
      startStdioTransport();
    }
  } catch (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
  }
}

main();
