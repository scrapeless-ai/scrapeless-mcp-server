import { defineTool, wrapMcpResponse } from "../utils.js";
import z from "zod";

export const scrapeScreenshot = defineTool({
  name: 'scrape_screenshot',
  description: 'Take a screenshot of a webpage using Universal Scraping API',
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
          response_type: "png",
          response_image_full_page: true
        }
      })
    );
  }
})


