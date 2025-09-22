import { defineTool, wrapMcpResponse } from "../utils.js";
import z from "zod";

export const scrapeMarkdown = defineTool({
  name: "scrape_markdown",
  description: `Scrape a URL and return its content as Markdown.
    Restrictions: Best for articles, blog posts, and other text-heavy pages.
    Valid: Scrape a news article to get its readable content.
    Invalid: Scrape a complex web application dashboard.`,
  inputSchema: {
    url: z.string().url().describe("target URL"),
  },
  handle: async (params, client) => {
    return wrapMcpResponse(() =>
      client.universal.scrape({
        actor: "unlocker.webunlocker",
        input: {
          url: params.url,
          redirect: true,
          jsRender: {
            enabled: true,
            headless: true,
            waitUntil: "domcontentloaded",
            instructions: [],
            block: { resources: [], urls: [] },
            response: { type: "markdown", options: { selector: "" } },
          },
        },
      })
    );
  },
});
