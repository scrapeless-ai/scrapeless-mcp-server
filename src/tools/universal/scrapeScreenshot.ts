import { defineTool } from "../utils.js";
import z from "zod";

export const scrapeScreenshot = defineTool({
  name: 'scrape_screenshot',
  description: `Capture a high-quality screenshot of any webpage.
    Restrictions: Bypasses bot detection and CAPTCHAs using residential proxies.
    Valid: Get a screenshot of a price-checker page protected by Cloudflare.
    Invalid: Taking a screenshot of the local browser (use browser_screenshot)`,
  inputSchema: {
    url: z.string().url().describe('target URL'),
  },
  handle: async (params, client) => {
    try {
      const result = await client.universal.scrape({
        actor: 'unlocker.webunlocker',
        input: {
          url: params.url,
          js_render: true,
          response_type: "png",
          response_image_full_page: true
        }
      })
      return {
        content: [
          {
            type: "image",
            data: result,
            mimeType: "image/png",
          },
          {
            type: "text",
            text: result,
          }
        ],
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch data. Error: ${(error as Error).message}`,
          },
        ],
      };
    }
  }
})
