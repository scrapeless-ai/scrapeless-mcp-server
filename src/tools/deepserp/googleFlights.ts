import { defineTool, wrapMcpResponse } from "../utils.js";
import z from "zod";

export const googleFlights = defineTool({
  name: "google_flights",
  description: `Exclusive Flight Information Query Tool.
    Activated only when requests include departure city, arrival city, and specific date/date range.
    Valid:Check flights from Beijing to Shanghai on July 15.
    Invalid:Compare airline service quality (use google_search instead)`,
  inputSchema: {
    gl: z
      .string()
      .describe(
        "Parameter defines the country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)."
      )
      .default("us"),
    hl: z
      .string()
      .describe(
        "Parameter defines the language to use for the Google search. It's a two-letter language code. (e.g., en for English, es for Spanish, or fr for French)."
      )
      .default("en"),
    currency: z
      .union([
        z.literal("ALL"),
        z.literal("DZD"),
        z.literal("ARS"),
        z.literal("AMD"),
        z.literal("AWG"),
        z.literal("AUD"),
        z.literal("AZN"),
        z.literal("BSD"),
        z.literal("BHD"),
        z.literal("BYN"),
        z.literal("BMD"),
        z.literal("BAM"),
        z.literal("BRL"),
        z.literal("GBP"),
        z.literal("BGN"),
        z.literal("XPF"),
        z.literal("CAD"),
        z.literal("CLP"),
        z.literal("CNY"),
        z.literal("COP"),
        z.literal("CRC"),
        z.literal("CUP"),
        z.literal("CZK"),
        z.literal("DKK"),
        z.literal("DOP"),
        z.literal("EGP"),
        z.literal("EUR"),
        z.literal("GEL"),
        z.literal("HKD"),
        z.literal("HUF"),
        z.literal("ISK"),
        z.literal("INR"),
        z.literal("IDR"),
        z.literal("IRR"),
        z.literal("ILS"),
        z.literal("JMD"),
        z.literal("JPY"),
        z.literal("JOD"),
        z.literal("KZT"),
        z.literal("KWD"),
        z.literal("LBP"),
        z.literal("MKD"),
        z.literal("MYR"),
        z.literal("MXN"),
        z.literal("MDL"),
        z.literal("MAD"),
        z.literal("TWD"),
        z.literal("NZD"),
        z.literal("NOK"),
        z.literal("OMR"),
        z.literal("PKR"),
        z.literal("PAB"),
        z.literal("PEN"),
        z.literal("PHP"),
        z.literal("PLN"),
        z.literal("QAR"),
        z.literal("RON"),
        z.literal("RUB"),
        z.literal("SAR"),
        z.literal("RSD"),
        z.literal("SGD"),
        z.literal("ZAR"),
        z.literal("KRW"),
        z.literal("SEK"),
        z.literal("CHF"),
        z.literal("THB"),
        z.literal("TRY"),
        z.literal("USD"),
        z.literal("UAH"),
        z.literal("AED"),
        z.literal("VND"),
      ])
      .describe(
        "Parameter defines the currency of the returned prices. Default to USD."
      )
      .optional(),
    departure_id: z
      .string()
      .describe(
        "Departure airport code or location kgmid. An airport code is an uppercase 3-letter code. You can search for it on Google Flights or IATA. For example, CDG is Paris Charles de Gaulle Airport, /m/0vzm is the location kgmid for Austin.You can specify multiple departure airports by separating them with a comma. For example, CDG,ORY,/m/04jpl."
      )
      .default("ORY"),
    arrival_id: z
      .string()
      .describe(
        "An airport code is an uppercase 3-letter code. You can search for it on Google Flights or IATA."
      )
      .default("BCN"),
    data_type: z
      .number()
      .describe(
        "Parameter defines the type of the flights.\nAvailable options:\n1 - Round trip (default)\n2 - One way\n3 - Multi-city\n\nWhen this parameter is set to 3, use multi_city_json to set the flight information.\n\nTo obtain the returning flight information for Round Trip (1), you need to make another request using a departure_token."
      )
      .default(1),
    travel_class: z
      .union([
        z.literal(1).describe("Economy(default) - 1"),
        z.literal(2).describe("Premium economy - 2"),
        z.literal(3).describe("Business - 3"),
        z.literal(4).describe("First - 4"),
      ])
      .describe(
        "Parameter defines the travel class.\nAvailable options:\n1 - Economy (default)\n2 - Premium economy\n3 - Business\n4 - First"
      )
      .default(1),
    multi_city_json: z
      .any()
      .describe(
        "Parameter defines the flight information for multi-city flights. It's a JSON string containing multiple flight information objects. Each object should contain the following fields: departure_id, arrival_id, date, times (optional). See schema for details."
      )
      .optional(),
    adults: z
      .number()
      .describe("Parameter defines the number of adults. Default to 1.")
      .default(1),
    children: z
      .number()
      .describe("Parameter defines the number of children. Default to 0.")
      .default(0),
    infants_in_seat: z
      .number()
      .describe(
        "Parameter defines the number of infants in seat. Default to 0."
      )
      .default(0),
    infants_on_lap: z
      .number()
      .describe("Parameter defines the number of infants on lap. Default to 0.")
      .default(0),
    outbound_date: z
      .string()
      .describe(
        "Parameter defines the outbound date. The format is YYYY-MM-DD. e.g. 2025-03-09"
      )
      .default("next_1d"),
    return_date: z
      .string()
      .describe(
        "Parameter defines the return date. The format is YYYY-MM-DD. e.g. 2025-03-15\n\nParameter is required if type parameter is set to: 1 (Round trip)"
      )
      .default("next_1w"),
    stops: z
      .union([
        z.literal(0).describe("Any number of stops (default) - 0"),
        z.literal(1).describe("Nonstop only - 1"),
        z.literal(2).describe("1 stop or fewer - 2"),
        z.literal(3).describe("2 stops or fewer - 3"),
      ])
      .describe(
        "Parameter defines the number of stops during the flight.\nAvailable options:\n0 - Any number of stops (default)\n1 - Nonstop only\n2 - 1 stop or fewer\n3 - 2 stops or fewer"
      )
      .default(0),
    include_airlines: z
      .string()
      .describe(
        "Parameter defines the airline codes to be included. Split multiple airlines with comma. It can't be used together with exclude_airlines. Each airline code should be a 2-character IATA code consisting of either two uppercase letters or one uppercase letter and one digit. Alliances can also be included. See schema for details."
      )
      .optional()
      .optional(),
    bags: z
      .number()
      .describe("Parameter defines the number of carry-on bags. Default to 0.")
      .default(0),
    max_price: z
      .number()
      .describe(
        "Parameter defines the maximum ticket price. Default to unlimited."
      )
      .default(0),
    outbound_times: z
      .string()
      .describe(
        "Parameter defines the outbound times range. See schema for details."
      )
      .optional()
      .optional(),
    return_times: z
      .string()
      .describe(
        "Parameter defines the return times range. See schema for details."
      )
      .optional()
      .optional(),
    emissions: z
      .union([
        z.literal(0).describe("reset"),
        z.literal(1).describe("Less emissions only - ·"),
      ])
      .describe(
        "Parameter defines the emission level of the flight.\nAvailable options:\n1 - Less emissions only"
      )
      .default(0),
    layover_duration: z
      .string()
      .describe(
        "Parameter defines the layover duration, in minutes. It's a string containing two comma-separated numbers. See schema for details."
      )
      .optional()
      .optional(),
    exclude_conns: z
      .string()
      .describe(
        "Parameter defines the connecting airport codes to be excluded. See schema for details."
      )
      .optional()
      .optional(),
    max_duration: z
      .number()
      .describe(
        "Parameter defines the maximum flight duration, in minutes. For example, specify 1500 for 25 hours."
      )
      .default(0)
      .optional(),
    departure_token: z
      .string()
      .describe(
        "Parameter is used to select the flight and get returning flights (for Round trip) or flights for the next leg of itinerary (for Multi-city). Find this token in the departure flight results."
      )
      .optional()
      .optional(),
  },
  handle: async (params, client) => {
    return wrapMcpResponse(() =>
      client.deepserp.scrape({
        actor: "scraper.google.flights",
        input: params,
      })
    );
  },
});
