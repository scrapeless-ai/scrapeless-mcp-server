import axios, { AxiosInstance } from "axios";
import { ScrapelessClient } from "@scrapeless-ai/sdk";
import { API_KEY, BASE_URL, API_KEY_NAME } from "../../config.js";

/**
 * Build an axios instance targeting the Scrapeless v2 scraper task API.
 *
 * The `x-api-token` is resolved from the per-request client when available
 * (so multi-tenant HTTP mode keeps using the caller's key) and falls back to
 * the `SCRAPELESS_API_KEY` (or legacy `SCRAPELESS_KEY`) environment variable.
 */
export function getAiScraperApi(
  client?: ScrapelessClient,
  headers?: Record<string, string>
): AxiosInstance {
  // Priority: explicit request header (HTTP multi-tenant) -> key carried by the
  // per-request client -> SCRAPELESS_API_KEY / SCRAPELESS_KEY env (stdio / fallback).
  const apiKey =
    headers?.[API_KEY_NAME] ||
    (client as any)?.scraping?.apiKey ||
    API_KEY ||
    "";

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      [API_KEY_NAME]: apiKey,
    },
    timeout: 30000,
  });
}

export const AI_SCRAPER_REQUEST_ENDPOINT = "/api/v2/scraper/request";
export const AI_SCRAPER_RESULT_ENDPOINT = "/api/v2/scraper/result";
