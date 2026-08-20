import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { defineTool } from "../utils.js";
import { getCrawlApi, CRAWL_ENDPOINT } from "./api.js";
import z from "zod";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TERMINAL_STATUSES = ["completed", "failed", "cancelled"];

export const crawlResult = defineTool({
  name: "crawl_result",
  description: `Fetch the result of a crawl job by its id (the id returned by crawl_start).
    Polls the job status until it reaches a terminal state (completed / failed / cancelled) or the timeout is reached.
    If the timeout is reached before the job finishes, the latest status is returned along with the job id so you can retry later.`,
  inputSchema: {
    id: z
      .string()
      .describe("The crawl job id returned when the job was created."),
    timeout: z
      .number()
      .optional()
      .describe(
        "Maximum time to wait in seconds before returning the latest result. Defaults to 300 (5 minutes)."
      ),
    pollInterval: z
      .number()
      .optional()
      .describe(
        "Interval between status checks in seconds. Defaults to 5 seconds."
      ),
  },
  handle: async (params, client, headers): Promise<CallToolResult> => {
    const { id } = params;
    const timeoutMs = (params.timeout ?? 300) * 1000;
    const pollIntervalMs = (params.pollInterval ?? 5) * 1000;

    const api = getCrawlApi(client, headers);
    const deadline = Date.now() + timeoutMs;

    try {
      let data: any;
      while (true) {
        const response = await api.get(`${CRAWL_ENDPOINT}/${id}`);
        data = response.data;

        if (data && TERMINAL_STATUSES.includes(data.status)) {
          return {
            content: [
              {
                type: "text",
                text: `Response:\n\n${JSON.stringify(data)}`,
              },
            ],
          };
        }

        if (Date.now() + pollIntervalMs >= deadline) {
          return {
            content: [
              {
                type: "text",
                text:
                  `The crawl job did not finish within the timeout. ` +
                  `Latest status is "${data?.status}". You can call crawl_result again ` +
                  `with this job id to keep waiting, or crawl_cancel to cancel it.\n\n` +
                  `Job ID: ${id}\n\nLatest response:\n\n${JSON.stringify(data)}`,
              },
            ],
          };
        }

        await sleep(pollIntervalMs);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch crawl result for job ${id}. Error: ${
              (error as Error).message
            }`,
          },
        ],
      };
    }
  },
});
