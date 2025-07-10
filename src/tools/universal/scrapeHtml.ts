import { defineTool, wrapMcpResponse } from "../utils.js";
import z from "zod";

export const scrapeHtml = defineTool({
  name: 'scrape_html',
  description: `Scrape a URL and return its full HTML content.
    Restrictions: Activated for URLs that require JavaScript rendering or bot protection.
    Valid: Get HTML from a dynamic, JS-heavy single-page application.
    Invalid: Fetching a simple static page (use a standard HTTP client).`,
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
