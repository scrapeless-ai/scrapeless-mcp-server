import { defineTool, wrapMcpResponse } from "../utils.js";
import { getCrawlApi, CRAWL_ENDPOINT } from "./api.js";
import z from "zod";

const formatEnum = z.enum([
  "markdown",
  "html",
  "rawHtml",
  "links",
  "screenshot",
  "screenshot@fullPage",
  "json",
]);

const scrapeOptionsSchema = z
  .object({
    formats: z
      .array(formatEnum)
      .optional()
      .describe("Formats to include in the output. Defaults to ['markdown']."),
    onlyMainContent: z
      .boolean()
      .optional()
      .describe(
        "Only return the main content of the page excluding headers, navs, footers, etc."
      ),
    includeTags: z
      .array(z.string())
      .optional()
      .describe("Tags to include in the output."),
    excludeTags: z
      .array(z.string())
      .optional()
      .describe("Tags to exclude from the output."),
    headers: z
      .record(z.any())
      .optional()
      .describe(
        "Headers to send with the request. Can be used to send cookies, user-agent, etc."
      ),
    waitFor: z
      .number()
      .optional()
      .describe(
        "Delay in milliseconds before fetching the content, allowing the page sufficient time to load."
      ),
    timeout: z
      .number()
      .optional()
      .describe("Timeout in milliseconds for the request."),
  })
  .describe("Options that control how each page is scraped.");

const browserOptionsSchema = z
  .object({
    sessionName: z
      .string()
      .optional()
      .describe(
        "A name for your session to facilitate searching and viewing in the historical session list."
      ),
    sessionTTL: z
      .string()
      .optional()
      .describe(
        "Session duration in seconds. Defaults to 180s, customizable between 60s and 900s."
      ),
    sessionRecording: z
      .string()
      .optional()
      .describe("Whether to enable session recording. Defaults to false."),
    proxyCountry: z
      .string()
      .optional()
      .describe(
        "Target country/region for the proxy as a country code (e.g. US, GB, ANY)."
      ),
    proxyURL: z
      .string()
      .optional()
      .describe(
        "Custom proxy URL, e.g. http://user:pass@ip:port. If set, all other proxy_* parameters are ignored."
      ),
    fingerprint: z
      .string()
      .optional()
      .describe("Custom browser fingerprint configuration."),
  })
  .describe("Options that control the underlying scraping browser session.");

export const crawlStart = defineTool({
  name: "crawl_start",
  description: `Start an asynchronous crawl job. Crawls a website starting from a base URL, following links according to the provided options, and captures page content in various formats (markdown, html, links, screenshot, etc.).
    Returns a job id that can be used with crawl_result to fetch results and crawl_cancel to cancel the job.
    Only 'url' is required; all other parameters are optional.`,
  inputSchema: {
    url: z.string().url().describe("The base URL to start crawling from."),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of pages to crawl. Default limit is 10000."),
    excludePaths: z
      .array(z.string())
      .optional()
      .describe(
        "URL pathname regex patterns that exclude matching URLs from the crawl."
      ),
    includePaths: z
      .array(z.string())
      .optional()
      .describe(
        "URL pathname regex patterns that include matching URLs in the crawl."
      ),
    maxDepth: z
      .number()
      .optional()
      .describe(
        "Maximum depth to crawl relative to the base URL (max number of slashes in the pathname)."
      ),
    maxDiscoveryDepth: z
      .number()
      .optional()
      .describe("Maximum depth to crawl based on discovery order."),
    ignoreSitemap: z
      .boolean()
      .optional()
      .describe("Ignore the website sitemap when crawling."),
    ignoreQueryParameters: z
      .boolean()
      .optional()
      .describe(
        "Do not re-scrape the same path with different (or none) query parameters."
      ),
    deduplicateSimilarURLs: z
      .boolean()
      .optional()
      .describe("Controls whether similar URLs should be deduplicated."),
    regexOnFullURL: z
      .boolean()
      .optional()
      .describe(
        "Controls whether the include/exclude regex should be applied to the full URL."
      ),
    allowBackwardLinks: z
      .boolean()
      .optional()
      .describe(
        "Allow the crawler to follow links that are not part of the URL hierarchy you specify."
      ),
    allowExternalLinks: z
      .boolean()
      .optional()
      .describe("Allow the crawler to follow links to external websites."),
    delay: z
      .number()
      .optional()
      .describe(
        "Delay in seconds between scrapes. This helps respect website rate limits."
      ),
    scrapeOptions: scrapeOptionsSchema.optional(),
    browserOptions: browserOptionsSchema.optional(),
  },
  handle: async (params, client, headers) => {
    return wrapMcpResponse(async () => {
      const api = getCrawlApi(client, headers);
      const { data } = await api.post(CRAWL_ENDPOINT, params);
      return data;
    });
  },
});
