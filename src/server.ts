import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ScrapelessClient } from "./client.js";
import { SCRAPELESS_CONFIG, TOOL_ENDPOINTS } from "./config.js";

const scrapelessClient = new ScrapelessClient(SCRAPELESS_CONFIG);

export const server = new McpServer({
  name: "scrapeless-mcp-server",
  version: "0.2.0",
  capabilities: { resources: {}, tools: {} },
});

server.tool(
  "google-search",
  "Fetch Google Search Results",
  {
    query: z
      .string()
      .describe(
        "Parameter defines the query you want to search. You can use anything that you would use in a regular Google search. e.g. inurl:, site:, intitle:. We also support advanced search query parameters such as as_dt and as_eq."
      ),
    gl: z
      .string()
      .optional()
      .describe(
        "Parameter defines the country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)."
      ),
    hl: z
      .string()
      .optional()
      .describe(
        "Parameter defines the language to use for the Google search. It's a two-letter language code. (e.g., en for English, es for Spanish, or fr for French)."
      ),
  },
  async ({ query, gl = "us", hl = "en" }) => {
    const response = await scrapelessClient.sendRequest(
      TOOL_ENDPOINTS.SCRAPER,
      "scraper.google.search",
      {
        q: query,
        gl,
        hl,
        location: "",
      }
    );

    return {
      content: response.content.map((item) => ({
        type: "text",
        text: item.text,
      })),
    };
  }
);

server.tool(
  "google-flights-search",
  "Search for flights using Google Flights via Scrapeless API",
  {
    departure_id: z
      .string()
      .describe(
        "Airport code for departure (e.g., CDG for Paris Charles de Gaulle)"
      ),
    arrival_id: z
      .string()
      .describe("Airport code for arrival (e.g., BCN for Barcelona)"),
    outbound_date: z.string().describe("Departure date in YYYY-MM-DD format"),
    return_date: z
      .string()
      .optional()
      .describe("Return date in YYYY-MM-DD format for round trips"),
    gl: z
      .string()
      .optional()
      .describe("Country code (e.g., us for United States, fr for France)"),
    hl: z
      .string()
      .optional()
      .describe("Language code (e.g., en for English, fr for French)"),
    currency: z.string().optional().describe("Currency code (e.g., USD, EUR)"),
    travel_class: z
      .string()
      .optional()
      .describe(
        "Travel class (1 for Economy, 2 for Business, 3 for First Class)"
      ),
    adults: z.string().optional().describe("Number of adult passengers"),
    children: z.string().optional().describe("Number of children passengers"),
    max_price: z
      .string()
      .optional()
      .describe("Maximum price to filter results"),
    stops: z.string().optional().describe("Filter by number of stops"),
    emissions: z
      .string()
      .optional()
      .describe("Filter for emissions (e.g., 'Less emissions only')"),
    data_type: z
      .string()
      .optional()
      .default("1")
      .describe("Type of flight (1 for Round trip, 2 for One-way)"),
  },
  async (params) => {
    const searchParams = {
      departure_id: params.departure_id,
      arrival_id: params.arrival_id,
      outbound_date: params.outbound_date,
      return_date: params.return_date,
      data_type: params.data_type || "1",
      gl: params.gl || "us",
      hl: params.hl || "en",
      currency: params.currency,
      travel_class: params.travel_class,
      adults: params.adults,
      children: params.children,
      max_price: params.max_price,
      stops: params.stops,
      emissions: params.emissions,
    };

    const response = await scrapelessClient.sendRequest(
      TOOL_ENDPOINTS.SCRAPER,
      "scraper.google.flights",
      searchParams
    );

    return {
      content: response.content.map((item) => ({
        type: "text",
        text: item.text,
      })),
    };
  }
);
