export interface ScrapelessConfig {
    baseURL: string;
    token: string;
}

const API_KEY = process.env.SCRAPELESS_KEY?.trim();
const BASE_URL = process.env.SCRAPELESS_BASE_URL?.trim() || "https://api.scrapeless.com";

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

