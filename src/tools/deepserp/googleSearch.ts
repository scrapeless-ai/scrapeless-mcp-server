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
    google_domain: z
      .union([
        z.literal("google.com"),
        z.literal("google.ad"),
        z.literal("google.ae"),
        z.literal("google.com.af"),
        z.literal("google.com.ag"),
        z.literal("google.com.ai"),
        z.literal("google.al"),
        z.literal("google.am"),
        z.literal("google.co.ao"),
        z.literal("google.com.ar"),
        z.literal("google.as"),
        z.literal("google.at"),
        z.literal("google.com.au"),
        z.literal("google.az"),
        z.literal("google.ba"),
        z.literal("google.com.bd"),
        z.literal("google.be"),
        z.literal("google.bf"),
        z.literal("google.bg"),
        z.literal("google.com.bh"),
        z.literal("google.bi"),
        z.literal("google.bj"),
        z.literal("google.com.bn"),
        z.literal("google.com.bo"),
        z.literal("google.com.br"),
        z.literal("google.bs"),
        z.literal("google.bt"),
        z.literal("google.co.bw"),
        z.literal("google.by"),
        z.literal("google.com.bz"),
        z.literal("google.ca"),
        z.literal("google.com.kh"),
        z.literal("google.cd"),
        z.literal("google.cf"),
        z.literal("google.cg"),
        z.literal("google.ch"),
        z.literal("google.ci"),
        z.literal("google.co.ck"),
        z.literal("google.cl"),
        z.literal("google.cm"),
        z.literal("google.com.co"),
        z.literal("google.co.cr"),
        z.literal("google.com.cu"),
        z.literal("google.cv"),
        z.literal("google.com.cy"),
        z.literal("google.cz"),
        z.literal("google.de"),
        z.literal("google.dj"),
        z.literal("google.dk"),
        z.literal("google.dm"),
        z.literal("google.com.do"),
        z.literal("google.dz"),
        z.literal("google.com.ec"),
        z.literal("google.ee"),
        z.literal("google.com.eg"),
        z.literal("google.es"),
        z.literal("google.com.et"),
        z.literal("google.fi"),
        z.literal("google.fm"),
        z.literal("google.com.fj"),
        z.literal("google.fr"),
        z.literal("google.ga"),
        z.literal("google.ge"),
        z.literal("google.com.gh"),
        z.literal("google.com.gi"),
        z.literal("google.gl"),
        z.literal("google.gm"),
        z.literal("google.gp"),
        z.literal("google.gr"),
        z.literal("google.com.gt"),
        z.literal("google.gy"),
        z.literal("google.com.hk"),
        z.literal("google.hn"),
        z.literal("google.hr"),
        z.literal("google.ht"),
        z.literal("google.hu"),
        z.literal("google.co.id"),
        z.literal("google.iq"),
        z.literal("google.ie"),
        z.literal("google.co.il"),
        z.literal("google.co.in"),
        z.literal("google.is"),
        z.literal("google.it"),
        z.literal("google.je"),
        z.literal("google.com.jm"),
        z.literal("google.jo"),
        z.literal("google.co.jp"),
        z.literal("google.co.ke"),
        z.literal("google.ki"),
        z.literal("google.kg"),
        z.literal("google.co.kr"),
        z.literal("google.com.kw"),
        z.literal("google.kz"),
        z.literal("google.la"),
        z.literal("google.com.lb"),
        z.literal("google.li"),
        z.literal("google.lk"),
        z.literal("google.co.ls"),
        z.literal("google.lt"),
        z.literal("google.lu"),
        z.literal("google.lv"),
        z.literal("google.com.ly"),
        z.literal("google.co.ma"),
        z.literal("google.md"),
        z.literal("google.mg"),
        z.literal("google.mk"),
        z.literal("google.ml"),
        z.literal("google.com.mm"),
        z.literal("google.mn"),
        z.literal("google.ms"),
        z.literal("google.com.mt"),
        z.literal("google.mu"),
        z.literal("google.mv"),
        z.literal("google.mw"),
        z.literal("google.com.mx"),
        z.literal("google.com.my"),
        z.literal("google.co.mz"),
        z.literal("google.com.na"),
        z.literal("google.ne"),
        z.literal("google.com.ng"),
        z.literal("google.com.ni"),
        z.literal("google.nl"),
        z.literal("google.no"),
        z.literal("google.com.np"),
        z.literal("google.nr"),
        z.literal("google.nu"),
        z.literal("google.co.nz"),
        z.literal("google.com.om"),
        z.literal("google.com.pk"),
        z.literal("google.com.pa"),
        z.literal("google.com.pe"),
        z.literal("google.com.ph"),
        z.literal("google.pl"),
        z.literal("google.com.pg"),
        z.literal("google.com.pr"),
        z.literal("google.ps"),
        z.literal("google.pt"),
        z.literal("google.com.py"),
        z.literal("google.com.qa"),
        z.literal("google.ro"),
        z.literal("google.rs"),
        z.literal("google.ru"),
        z.literal("google.rw"),
        z.literal("google.com.sa"),
        z.literal("google.com.sb"),
        z.literal("google.sc"),
        z.literal("google.se"),
        z.literal("google.com.sg"),
        z.literal("google.sh"),
        z.literal("google.si"),
        z.literal("google.sk"),
        z.literal("google.com.sl"),
        z.literal("google.sn"),
        z.literal("google.sm"),
        z.literal("google.so"),
        z.literal("google.sr"),
        z.literal("google.com.sv"),
        z.literal("google.td"),
        z.literal("google.tg"),
        z.literal("google.co.th"),
        z.literal("google.com.tj"),
        z.literal("google.tk"),
        z.literal("google.tl"),
        z.literal("google.tm"),
        z.literal("google.tn"),
        z.literal("google.to"),
        z.literal("google.com.tr"),
        z.literal("google.tt"),
        z.literal("google.com.tw"),
        z.literal("google.co.tz"),
        z.literal("google.com.ua"),
        z.literal("google.co.ug"),
        z.literal("google.co.uk"),
        z.literal("google.com.uy"),
        z.literal("google.co.uz"),
        z.literal("google.com.vc"),
        z.literal("google.co.ve"),
        z.literal("google.vg"),
        z.literal("google.co.vi"),
        z.literal("google.com.vn"),
        z.literal("google.vu"),
        z.literal("google.ws"),
      ])
      .describe(
        "Parameter defines the Google domain to use. It defaults to google.com."
      )
      .default("google.com"),
    start: z
      .number()
      .describe(
        "Parameter defines the result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.)."
      )
      .default(0),
    num: z
      .number()
      .describe(
        "Parameter defines the maximum number of results to return. (e.g., 10 (default) returns 10 results, 40 returns 40 results, and 100 returns 100 results)."
      )
      .default(10),
    ludocid: z
      .string()
      .describe(
        "Parameter defines the id (CID) of the Google My Business listing you want to scrape. Also known as Google Place ID."
      )
      .optional(),
    kgmid: z
      .string()
      .describe(
        "Parameter defines the id (KGMID) of the Google Knowledge Graph listing you want to scrape. Also known as Google Knowledge Graph ID. Searches with kgmid parameter will return results for the originally encrypted search parameters. For some searches, kgmid may override all other parameters except start, and num parameters."
      )
      .optional(),
    ibp: z
      .string()
      .describe(
        "Parameter is responsible for rendering layouts and expansions for some elements (e.g., gwp;0,7 to expand searches with ludocid for expanded knowledge graph)."
      )
      .optional(),
    cr: z
      .string()
      .describe(
        "Parameter defines one or multiple countries to limit the search to. It uses country{two-letter upper-case country code} to specify countries and | as a delimiter. (e.g., countryFR|countryDE will only search French and German pages)."
      )
      .optional(),
    lr: z
      .string()
      .describe(
        "Parameter defines one or multiple languages to limit the search to. It uses lang_{two-letter language code} to specify languages and | as a delimiter. (e.g., lang_fr|lang_de will only search French and German pages)."
      )
      .optional(),
    tbs: z
      .string()
      .describe(
        "(to be searched) parameter defines advanced search parameters that aren't possible in the regular query field. (e.g., advanced search for patents, dates, news, videos, images, apps, or text contents)."
      )
      .optional(),
    safe: z
      .union([
        z.literal("active").describe("Active"),
        z.literal("off").describe("Off"),
      ])
      .optional()
      .describe(
        "Parameter defines the level of filtering for adult content. It can be set to active or off, by default Google will blur explicit content."
      ),
    nfpr: z
      .union([z.literal("1").describe("1"), z.literal("0").describe("0")])
      .optional()
      .describe(
        "Parameter defines the exclusion of results from an auto-corrected query when the original query is spelled wrong. It can be set to 1 to exclude these results, or 0 to include them (default). Note that this parameter may not prevent Google from returning results for an auto-corrected query if no other results are available."
      ),
    filter: z
      .union([
        z.literal("1").describe("1(enable filters)"),
        z.literal("0").describe("0(disable filters)"),
      ])
      .optional()
      .describe(
        "Parameter defines if the filters for 'Similar Results' and 'Omitted Results' are on or off. It can be set to 1 (default) to enable these filters, or 0 to disable these filters."
      ),
    tbm: z
      .union([
        z.literal("isch").describe("isch - Google Images"),
        z.literal("lcl").describe("lcl - Google Local"),
        z.literal("nws").describe("nws - Google News"),
        z.literal("shop").describe("shop - Google Shopping"),
        z.literal("vid").describe("vid - Google Videos"),
        z.literal("pts").describe("pts - Google Patents"),
        z.literal("jobs").describe("jobs - Google Jobs"),
      ])
      .optional()
      .describe(
        "(to be matched) parameter defines the type of search you want to do.\n\nIt can be set to:\n(no tbm parameter): regular Google Search,\nisch: Google Images API,\nlcl - Google Local API\nvid: Google Videos API,\nnws: Google News API,\nshop: Google Shopping API,\npts: Google Patents API,\nor any other Google service."
      ),
  },
  handle: async (params, client) => {
    return wrapMcpResponse(() =>
      client.deepserp.scrape({
        actor: "scraper.google.search",
        input: params,
      })
    );
  },
});
