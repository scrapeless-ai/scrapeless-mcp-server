import { defineTool, wrapMcpResponse } from "../utils.js";
import z from "zod";

export const scrapeHtml = defineTool({
  name: 'scrape_html',
  description: 'Scrape HTML content from a URL using Universal Scraping API',
  inputSchema: {
    url: z.string().url().describe('target URL'),
  },
  handle: async (params, client) => {
    return wrapMcpResponse(() =>
      client.universal.scrape({
        actor: 'unlocker.webunlocker',
        input: {
          url: params.url,
          js_render: true,
          response_type: 'html'
        }
      })
    );
  }
})
