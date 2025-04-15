import axios, { AxiosInstance } from "axios";
import { ScrapelessConfig } from "./config.js";

export class ScrapelessClient {
  private api: AxiosInstance;

  constructor(config: ScrapelessConfig) {
    this.api = axios.create({
      baseURL: config.baseURL,
      headers: {
        "Content-Type": "application/json",
        "x-api-token": config.token,
      },
    });
  }

  async sendRequest<T>(endpoint: string, actor: string, inputData: T) {
    try {
      const response = await this.api.post(endpoint, {
        actor,
        input: inputData,
      });
      return {
        content: [
          {
            type: "text",
            text: `Response:\n\n${JSON.stringify(response.data)}`,
          },
        ],
      };
    } catch (error) {
      console.error("Scrapeless API Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch data. Error: ${(error as Error).message}`,
          },
        ],
      };
    }
  }
}
