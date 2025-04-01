import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import {ScrapelessClient} from "./client.js";
import {SCRAPELESS_CONFIG, TOOL_ENDPOINTS} from "./config.js";


const scrapelessClient = new ScrapelessClient(SCRAPELESS_CONFIG);

export const server = new McpServer({
    name: "scrapeless-mcp-server",
    version: "0.1.0",
    capabilities: {resources: {}, tools: {}},
});

server.tool(
    "google-search",
    "Fetch Google Search Results",
    {
        query: z.string().describe("Parameter defines the query you want to search. You can use anything that you would use in a regular Google search. e.g. inurl:, site:, intitle:. We also support advanced search query parameters such as as_dt and as_eq."),
        gl: z.string().optional().describe("Parameter defines the country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)."),
        hl: z.string().optional().describe("Parameter defines the language to use for the Google search. It's a two-letter language code. (e.g., en for English, es for Spanish, or fr for French)."),
    },
    async ({query, gl = "us", hl = "en"}) => {
        const response = await scrapelessClient.sendRequest(TOOL_ENDPOINTS.SCRAPER, "scraper.google.search", {
            q: query,
            gl,
            hl,
            location: ""
        });

        return {
            content: response.content.map((item) => ({
                type: "text",
                text: item.text,
            })),
        };
    }
);