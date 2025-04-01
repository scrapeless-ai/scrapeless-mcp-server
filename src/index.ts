#!/usr/bin/env node
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {server} from "./server.js";

async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
    } catch (error) {
        console.error("Fatal error in main():", error);
        process.exit(1);
    }
}

main();