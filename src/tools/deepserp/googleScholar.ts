import { defineTool, wrapMcpResponse } from "../utils.js";
import z from "zod";

export const googleScholar = defineTool({
  name: 'google_scholar',
  description: `Search for academic papers on Google Scholar.
    Restrictions: Activated only for academic or scientific research queries.
    Valid: Find papers by "Yoshua Bengio" on deep learning.
    Invalid: Search for news articles about "Yoshua Bengio" (use google_search).`,
  inputSchema: {
    q: z
      .string()
      .describe(
        'Parameter defines the query you want to search. You can also use helpers in your query such as: author:, or source:. Usage of cites parameter makes q optional. Usage of cites together with q triggers search within citing articles. Usage of cluster together with q and cites parameters is prohibited. Use cluster parameter only.'
      )
      .default('Coffee'),
    cites: z
      .string()
      .describe(
        'Parameter defines unique ID for an article to trigger Cited By searches. Usage of cites will bring up a list of citing documents in Google Scholar. Example value: cites=1275980731835430123. Usage of cites and q parameters triggers search within citing articles.'
      )
      .optional(),
    as_ylo: z
      .string()
      .describe(
        'Parameter defines the year from which you want the results to be included. (e.g. if you set as_ylo parameter to the year 2018, the results before that year will be omitted.). This parameter can be combined with the as_yhi parameter.'
      )
      .optional(),
    as_yhi: z
      .string()
      .describe(
        'Parameter defines the year until which you want the results to be included. (e.g. if you set as_yhi parameter to the year 2018, the results after that year will be omitted.). This parameter can be combined with the as_ylo parameter.'
      )
      .optional(),
    scisbd: z
      .string()
      .describe(
        'Parameter defines articles added in the last year, sorted by date. It can be set to 1 to include only abstracts, or 2 to include everything. The default value is 0 which means that the articles are sorted by relevance.'
      )
      .optional(),
    cluster: z.string().describe('Versions Of').optional(),
    hl: z.string().describe('Language').default('en'),
    author_id: z.string().describe('Show in google.scholar result').optional(),
    citation_id: z
      .string()
      .describe(
        'Parameter is used for retrieving individual article citation. It is a required parameter when view_op=view_citation is selected. You can access IDs inside our structured JSON response.'
      )
      .optional(),
    view_op: z
      .union([
        z.literal('view_citation').describe('View Citation'),
        z.literal('list_colleagues').describe('View List Colleagues')
      ])
      .describe(
        'Parameter is used for viewing specific parts of a page. It has two options: view_citation - Select to view citations. citation_id is required. list_colleagues - Select to view all co-authors'
      )
      .optional(),
    lr: z.string().describe('Set Multiple Languages').optional(),
    start: z.string().describe('Result Offset').optional(),
    num: z.string().describe('Number of Results').optional(),
    as_sdt: z
      .union([z.literal('1').describe('Abstracts'), z.literal('2').describe('Everything')])
      .describe('Search Type / Filter')
      .optional(),
    safe: z
      .union([z.literal('active').describe('Active'), z.literal('off').describe('Off')])
      .describe('Adult Content Filtering')
      .optional(),
    filter: z
      .union([z.literal('1').describe('On'), z.literal('0').describe('Off')])
      .describe('Results Filtering')
      .optional(),
    as_vis: z
      .union([z.literal('1').describe('On'), z.literal('0').describe('Off')])
      .describe('Show Citations')
      .optional(),
    as_rr: z
      .union([z.literal('1').describe('On'), z.literal('0').describe('Off')])
      .describe('Show Only Review Articles')
      .optional()
  },
  handle: async (params, client) => {
    return wrapMcpResponse(() =>
      client.deepserp.scrape({
        actor: 'scraper.google.scholar',
        input: params
      })
    );
  }
})
