import { defineTool, wrapMcpResponse } from "../utils.js";
import z from "zod";

export const scrapeMarkdown = defineTool({
  name: 'scrape_markdown',
  description: 'Scrape Markdown content from a URL using Universal Scraping API',
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
          response_type: 'markdown'
        }
      })
    );
  }
})


