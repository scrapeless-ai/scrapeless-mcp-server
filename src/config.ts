import {getParamValue} from "@chatmcp/sdk/utils/index.js";

export interface ScrapelessConfig {
    baseURL: string;
    token: string;
}

const API_KEY = process.env.SCRAPELESS_KEY?.trim() || getParamValue("SCRAPELESS_KEY");
const BASE_URL = process.env.SCRAPELESS_BASE_URL?.trim() || "https://api.scrapeless.com";
export const ServerMode = getParamValue("mode") || "stdio";
export const ServerPort = getParamValue("port") || 9593;
export const ServerEndpoint = getParamValue("endpoint") || "/rest";

if (!API_KEY) {
    throw new Error("❌ Missing environment variable: SCRAPELESS_KEY");
}

export const TOOL_ENDPOINTS = {
    SCRAPER: "/api/v1/scraper/request",
};

export const SCRAPELESS_CONFIG: ScrapelessConfig = {
    baseURL: BASE_URL,
    token: API_KEY,
};

