import { defineTool, wrapMcpResponse } from "../utils.js";
import { getCrawlApi, CRAWL_ENDPOINT } from "./api.js";
import z from "zod";

export const crawlCancel = defineTool({
  name: "crawl_cancel",
  description: `Cancel an in-progress crawl job by its id (the id returned by crawl_start). Returns the cancelled status.`,
  inputSchema: {
    id: z
      .string()
      .describe("The crawl job id returned when the job was created."),
  },
  handle: async (params, client, headers) => {
    return wrapMcpResponse(async () => {
      const api = getCrawlApi(client, headers);
      const { data } = await api.delete(`${CRAWL_ENDPOINT}/${params.id}`);
      return data;
    });
  },
});
