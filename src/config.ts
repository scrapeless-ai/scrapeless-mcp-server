import { getParamValue } from "@chatmcp/sdk/utils/index.js";
import { ScrapelessConfig } from "@scrapeless-ai/sdk";

export const API_KEY =
process.env.SCRAPELESS_KEY?.trim() || getParamValue("SCRAPELESS_KEY");
export const BASE_URL =
process.env.SCRAPELESS_BASE_URL?.trim() || "https://api.scrapeless.com";
export const API_KEY_NAME = "x-api-token";

export const ServerMode = getParamValue("mode") || "stdio";
export const ServerPort = getParamValue("port");
export const ServerHostname = getParamValue("hostname") || "0.0.0.0";

export const SCRAPELESS_CONFIG: ScrapelessConfig = {
  baseApiUrl: BASE_URL,
  apiKey: API_KEY,
};
