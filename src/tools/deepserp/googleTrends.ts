import { defineTool, wrapMcpResponse } from "../utils.js";
import z from "zod";

export const googleTrends = defineTool({
  name: 'google_trends',
  description: `Get trending search data from Google Trends.
    Restrictions: Activated for queries about trends, popularity, or interest over time.
    Valid: Find the search interest for "AI" over the last year.
    Invalid: A general question like "What is AI?" (use google_search).`,
  inputSchema: {
    q: z
      .string()
      .describe(
        'Parameter defines the query or queries you want to search. You can use anything that you would use in a regular Google Trends search. The maximum number of queries per search is 5 (this only applies to interest_over_time and compared_breakdown_by_region data_type, other types of data will only accept 1 query per search).'
      )
      .default('Mercedes-Benz,BMW X5'),
    data_type: z
      .union([
        z.literal('autocomplete').describe('Auto complete'),
        z.literal('interest_over_time').describe('Interest over time'),
        z.literal('compared_breakdown_by_region').describe('Compared breakdown by region'),
        z.literal('interest_by_subregion').describe('Interest by region'),
        z.literal('related_queries').describe('Related queries'),
        z.literal('related_topics').describe('Related topics')
      ])
      .describe(
        'The supported types are: autocomplete,interest_over_time,compared_breakdown_by_region,interest_by_subregion,related_queries,related_topics.'
      )
      .default('interest_over_time'),
    date: z
      .string()
      .describe(
        'The supported dates are: now 1-H, now 4-H, now 1-d, now 7-d, today 1-m, today 3-m, today 12-m, today 5-y, all.\n\nYou can also pass custom values:\n\nDates from 2004 to present: yyyy-mm-dd yyyy-mm-dd (e.g. 2021-10-15 2022-05-25)\nDates with hours within a week range: yyyy-mm-ddThh yyyy-mm-ddThh (e.g. 2022-05-19T10 2022-05-24T22). Hours will be calculated depending on the tz (time zone) parameter.'
      )
      .default('today 1-m'),
    hl: z
      .string()
      .describe(
        "Parameter defines the language to use for the Google Trends search. It's a two-letter language code. (e.g., en for English, es for Spanish, or fr for French)."
      )
      .default('en'),
    tz: z.string().describe('time zone offset. default is 420.').default('420'),
    geo: z
      .union([
        z.literal(''),
        z.literal('AR'),
        z.literal('AU'),
        z.literal('AT'),
        z.literal('BE'),
        z.literal('BR'),
        z.literal('CA'),
        z.literal('CL'),
        z.literal('CO'),
        z.literal('CZ'),
        z.literal('DK'),
        z.literal('EG'),
        z.literal('FI'),
        z.literal('FR'),
        z.literal('DE'),
        z.literal('GR'),
        z.literal('HK'),
        z.literal('HU'),
        z.literal('IN'),
        z.literal('ID'),
        z.literal('IE'),
        z.literal('IL'),
        z.literal('IT'),
        z.literal('JP'),
        z.literal('KE'),
        z.literal('MY'),
        z.literal('MX'),
        z.literal('NL'),
        z.literal('NZ'),
        z.literal('NG'),
        z.literal('NO'),
        z.literal('PE'),
        z.literal('PH'),
        z.literal('PL'),
        z.literal('PT'),
        z.literal('RO'),
        z.literal('RU'),
        z.literal('SA'),
        z.literal('SG'),
        z.literal('ZA'),
        z.literal('KR'),
        z.literal('ES'),
        z.literal('SE'),
        z.literal('CH'),
        z.literal('TW'),
        z.literal('TH'),
        z.literal('TR'),
        z.literal('UA'),
        z.literal('GB'),
        z.literal('US'),
        z.literal('VN')
      ])
      .describe(
        'Parameter defines the location from where you want the search to originate. It defaults to Worldwide (activated when the value of geo parameter is not set or empty).'
      )
      .optional(),
    cat: z
      .union([
        z.literal('0').describe('All categories'),
        z.literal('3').describe('Arts & Entertainment'),
        z.literal('5').describe('Computers & Electronics'),
        z.literal('7').describe('Finance'),
        z.literal('8').describe('Games'),
        z.literal('11').describe('Home & Garden'),
        z.literal('12').describe('Business & Industrial'),
        z.literal('13').describe('Internet & Telecom'),
        z.literal('14').describe('People & Society'),
        z.literal('16').describe('News'),
        z.literal('18').describe('Shopping'),
        z.literal('19').describe('Law & Government'),
        z.literal('20').describe('Sports'),
        z.literal('22').describe('Books & Literature'),
        z.literal('23').describe('Performing Arts'),
        z.literal('24').describe('Visual Art & Design'),
        z.literal('25').describe('Advertising & Marketing'),
        z.literal('28').describe('Office Services'),
        z.literal('29').describe('Real Estate'),
        z.literal('30').describe('Computer Hardware'),
        z.literal('31').describe('Programming'),
        z.literal('32').describe('Software'),
        z.literal('33').describe('Offbeat'),
        z.literal('34').describe('Movies'),
        z.literal('35').describe('Music & Audio'),
        z.literal('36').describe('TV & Video'),
        z.literal('37').describe('Banking'),
        z.literal('38').describe('Insurance'),
        z.literal('39').describe('Card Games'),
        z.literal('41').describe('Computer & Video Games'),
        z.literal('42').describe('Jazz'),
        z.literal('43').describe('Online Goodies'),
        z.literal('44').describe('Beauty & Fitness'),
        z.literal('45').describe('Health'),
        z.literal('46').describe('Agriculture & Forestry'),
        z.literal('47').describe('Autos & Vehicles'),
        z.literal('48').describe('Construction & Maintenance'),
        z.literal('49').describe('Manufacturing'),
        z.literal('50').describe('Transportation & Logistics'),
        z.literal('53').describe('Web Hosting & Domain Registration'),
        z.literal('54').describe('Social Issues & Advocacy'),
        z.literal('55').describe('Dating & Personals'),
        z.literal('56').describe('Ethnic & Identity Groups'),
        z.literal('57').describe('Charity & Philanthropy'),
        z.literal('58').describe('Parenting'),
        z.literal('59').describe('Religion & Belief'),
        z.literal('60').describe('Jobs'),
        z.literal('61').describe('Classifieds'),
        z.literal('63').describe('Weather'),
        z.literal('64').describe('Antiques & Collectibles'),
        z.literal('65').describe('Hobbies & Leisure'),
        z.literal('66').describe('Pets & Animals'),
        z.literal('67').describe('Travel'),
        z.literal('68').describe('Apparel'),
        z.literal('69').describe('Consumer Resources'),
        z.literal('70').describe('Gifts & Special Event Items'),
        z.literal('71').describe('Food & Drink'),
        z.literal('73').describe('Mass Merchants & Department Stores'),
        z.literal('74').describe('Education'),
        z.literal('75').describe('Legal'),
        z.literal('76').describe('Government'),
        z.literal('77').describe('Enterprise Technology'),
        z.literal('78').describe('Consumer Electronics'),
        z.literal('82').describe('Environmental Issues'),
        z.literal('83').describe('Marketing Services'),
        z.literal('84').describe('Search Engine Optimization & Marketing'),
        z.literal('89').describe('Vehicle Parts & Accessories'),
        z.literal('91').describe('Stereo Systems & Components'),
        z.literal('93').describe('Skin & Nail Care'),
        z.literal('94').describe('Fitness'),
        z.literal('95').describe('Office Supplies'),
        z.literal('96').describe('Real Estate Agencies'),
        z.literal('97').describe('Consumer Advocacy & Protection'),
        z.literal('98').describe('Fashion Designers & Collections'),
        z.literal('99').describe('Gifts'),
        z.literal('100').describe('Cards & Greetings'),
        z.literal('101').describe('Spirituality'),
        z.literal('102').describe('Personals'),
        z.literal('104').describe('ISPs'),
        z.literal('105').describe('Online Games'),
        z.literal('107').describe('Investing'),
        z.literal('108').describe('Language Resources'),
        z.literal('112').describe('Broadcast & Network News'),
        z.literal('113').describe('Gay-Lesbian-Bisexual-Transgender'),
        z.literal('115').describe('Baby Care & Hygiene'),
        z.literal('118').describe('Water Sports'),
        z.literal('119').describe('Wildlife'),
        z.literal('120').describe('Cookware & Diningware'),
        z.literal('121').describe('Grocery & Food Retailers'),
        z.literal('122').describe('Cooking & Recipes'),
        z.literal('123').describe('Tobacco Products'),
        z.literal('124').describe('Clothing Accessories'),
        z.literal('137').describe('Homemaking & Interior Decor'),
        z.literal('138').describe('Vehicle Maintenance'),
        z.literal('143').describe('Face & Body Care'),
        z.literal('144').describe('Unwanted Body & Facial Hair Removal'),
        z.literal('145').describe('Spas & Beauty Services'),
        z.literal('146').describe('Hair Care'),
        z.literal('147').describe('Cosmetology & Beauty Professionals'),
        z.literal('148').describe('Off-Road Vehicles'),
        z.literal('154').describe('Kids & Teens'),
        z.literal('157').describe('Human Resources'),
        z.literal('158').describe('Home Improvement'),
        z.literal('166').describe('Public Safety'),
        z.literal('168').describe('Emergency Services'),
        z.literal('170').describe('Vehicle Licensing & Registration')
      ])
      .describe('Parameter is used to define a search category. The default value is set to 0 ("All categories").')
      .default('0')
  },
  handle: async (params, client) => {
    return wrapMcpResponse(() =>
      client.deepserp.scrape({
        actor: 'scraper.google.trends',
        input: params
      })
    );
  }
})
