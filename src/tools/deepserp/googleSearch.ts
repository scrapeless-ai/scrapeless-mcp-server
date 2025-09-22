import { defineTool, wrapMcpResponse } from "../utils.js";
import z from "zod";

export const googleSearch = defineTool({
  name: "google_search",
  description:
    "Universal Information Search Engine.Retrieves any data information; Explanatory queries (why, how).Comparative analysis requests",
  inputSchema: {
    q: z
      .string()
      .describe(
        "Parameter defines the query you want to search. You can use anything that you would use in a regular Google search. e.g. inurl:, site:, intitle:. We also support advanced search query parameters such as as_dt and as_eq."
      )
      .default("Top news headlines"),
    hl: z
      .string()
      .describe(
        "Parameter defines the language to use for the Google search. It's a two-letter language code. (e.g., en for English, es for Spanish, or fr for French)."
      )
      .default("en"),
    gl: z
      .string()
      .describe(
        "Parameter defines the country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)."
      )
      .default("us"),
  },
  handle: async (params, client) => {
    return wrapMcpResponse(async () => {
      const data: any = await client.deepserp.scrape({
        actor: "scraper.google.search",
        input: params,
      });
      return (
        data?.organic_results?.map((i: any) => ({
          position: i.position,
          title: i.title,
          link: i.link,
          redirect_link: i.redirect_link,
          snippet: i.snippet,
          snippet_highlighted_words: i.snippet_highlighted_words,
          source: i.source,
        })) ?? []
      );
    });
  },
});
