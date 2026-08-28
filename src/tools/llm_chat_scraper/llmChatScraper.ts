import axios, { AxiosInstance } from "axios";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";
import { BASE_URL } from "../../config.js";
import { defineTool } from "../utils.js";
import {
  getLlmChatScraperApi,
  LLM_CHAT_SCRAPER_REQUEST_ENDPOINT,
  LLM_CHAT_SCRAPER_RESULT_ENDPOINT,
} from "./api.js";

const POLL_INTERVAL_MS = 5000;
const DEFAULT_TIMEOUT_SECONDS = 180;
const MIN_TIMEOUT_SECONDS = 60;
const MAX_TIMEOUT_SECONDS = 600;

const ACTOR_OPTIONS = [
  "scraper.chatgpt",
  "scraper.gemini",
  "scraper.perplexity",
  "scraper.copilot",
  "scraper.aimode",
  "scraper.overview",
  "scraper.grok",
  "scraper.alexa",
] as const;

const MODE_OPTIONS = [
  "search",
  "smart",
  "chat",
  "reasoning",
  "study",
  "MODEL_MODE_FAST",
  "MODEL_MODE_EXPERT",
  "MODEL_MODE_AUTO",
] as const;

type Actor = (typeof ACTOR_OPTIONS)[number];

const ACTOR_CONFIG: Record<
  Actor,
  {
    displayName: string;
    supportsWebSearch?: boolean;
    supportsShopping?: boolean;
    supportsGoogleLocation?: boolean;
    supportsMode?: boolean;
    requiresMode?: boolean;
  }
> = {
  "scraper.chatgpt": {
    displayName: "ChatGPT",
    supportsWebSearch: true,
    supportsShopping: true,
  },
  "scraper.gemini": {
    displayName: "Gemini",
  },
  "scraper.perplexity": {
    displayName: "Perplexity",
    supportsWebSearch: true,
  },
  "scraper.copilot": {
    displayName: "Microsoft Copilot",
    supportsMode: true,
    requiresMode: true,
  },
  "scraper.aimode": {
    displayName: "Google AI Mode",
    supportsShopping: true,
    supportsGoogleLocation: true,
  },
  "scraper.overview": {
    displayName: "Google AI Overview",
    supportsShopping: true,
    supportsGoogleLocation: true,
  },
  "scraper.grok": {
    displayName: "Grok",
    supportsMode: true,
    requiresMode: true,
  },
  "scraper.alexa": {
    displayName: "Alexa",
  },
};

const RESULT_FIELDS_BY_ACTOR: Record<Actor, readonly string[]> = {
  "scraper.chatgpt": [
    "prompt",
    "result_text",
    "model",
    "web_search",
    "links",
    "search_result",
    "content_references",
    "products",
    "ads",
    "map",
    "search_model_queries",
  ],
  "scraper.gemini": [
    "result_text",
    "prompt",
    "citations",
    "related_queries",
  ],
  "scraper.perplexity": [
    "prompt",
    "result_text",
    "related_prompt",
    "web_results",
    "media_items",
  ],
  "scraper.copilot": [
    "result_text",
    "prompt",
    "mode",
    "links",
    "citations",
  ],
  "scraper.aimode": [
    "result_text",
    "result_md",
    "result_html",
    "raw_url",
    "citations",
    "search_result",
    "products",
  ],
  "scraper.overview": [
    "content",
    "rawtext",
    "metadata",
    "is_overview_shopping",
    "products",
    "source",
    "web_source",
    "ads",
  ],
  "scraper.grok": [
    "conversation",
    "create_time",
    "follow_up_suggestions",
    "full_response",
    "tool_usages",
    "user_model",
    "user_query",
    "web_search_results",
    "footnotes",
    "x_search_results",
  ],
  "scraper.alexa": [
    "user_text",
    "md_text",
    "raw_text",
    "completed",
    "answer_fragment_uri",
    "answer_revision",
    "dialog_request_id",
    "endpoint_id",
    "fragment_count",
    "conversation",
    "directives",
    "references",
    "sources",
    "suggestions",
    "products",
  ],
};

const llmChatScraperSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .describe("Question or prompt to send to the selected LLM Chat Scraper actor."),
  actor: z
    .enum(ACTOR_OPTIONS)
    .describe(
      "Scrapeless actor to run. Choose one explicitly: scraper.chatgpt, scraper.gemini, scraper.perplexity, scraper.copilot, scraper.aimode, scraper.overview, scraper.grok, or scraper.alexa."
    ),
  country: z
    .string()
    .optional()
    .default("US")
    .describe("Country or region code used by the actor. Defaults to US."),
  web_search: z
    .boolean()
    .optional()
    .describe(
      "Enable web search for scraper.chatgpt or scraper.perplexity when explicitly provided."
    ),
  shopping: z
    .boolean()
    .optional()
    .describe(
      "Fetch shopping/product data for scraper.chatgpt, scraper.aimode, or scraper.overview when explicitly provided."
    ),
  mode: z
    .enum(MODE_OPTIONS)
    .optional()
    .describe(
      "Required for scraper.copilot or scraper.grok. Copilot: search, smart, chat, reasoning, study. Grok: MODEL_MODE_FAST, MODEL_MODE_EXPERT, MODEL_MODE_AUTO."
    ),
  location: z
    .string()
    .optional()
    .describe(
      "Google canonical location for Google AI Mode or Google AI Overview. Mutually exclusive with uule."
    ),
  uule: z
    .string()
    .optional()
    .describe(
      "Pre-encoded Google UULE for Google AI Mode or Google AI Overview. Mutually exclusive with location."
    ),
  webhook: z
    .object({
      url: z
        .string()
        .url()
        .describe("Webhook URL Scrapeless calls when the task completes."),
    })
    .optional()
    .describe("Optional webhook object passed to the Scrapeless task request."),
  timeout_seconds: z
    .number()
    .int()
    .min(MIN_TIMEOUT_SECONDS)
    .max(MAX_TIMEOUT_SECONDS)
    .optional()
    .default(DEFAULT_TIMEOUT_SECONDS)
    .describe(
      "Maximum polling time in seconds. Defaults to 180. Minimum is 60 and maximum is 600."
    ),
});

type LlmChatScraperParams = z.infer<typeof llmChatScraperSchema>;

type PollResult = {
  taskId: string;
  status: string;
  terminal: boolean;
  ok: boolean;
  timedOut: boolean;
  startedAt: string;
  finishedAt: string;
  elapsedMs: number;
  latestResult: unknown;
  taskResult?: unknown;
  httpStatus?: number;
  error?: {
    status_code?: number;
    code: string;
    message: string;
    response: unknown;
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function textResponse(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: `Response:\n\n${JSON.stringify(data)}`,
      },
    ],
  };
}

function normalizeCountry(country: string | undefined) {
  const normalized = (country ?? "US").trim().toUpperCase();
  return normalized || "US";
}

function validateActorParams(params: LlmChatScraperParams) {
  const config = ACTOR_CONFIG[params.actor];

  if (params.location && params.uule) {
    return {
      code: "invalid_input",
      message: "location and uule are mutually exclusive.",
    };
  }

  if (params.web_search !== undefined && !config.supportsWebSearch) {
    return {
      code: "invalid_input",
      message: `web_search is not a supported option for ${params.actor}.`,
    };
  }

  if (params.shopping !== undefined && !config.supportsShopping) {
    return {
      code: "invalid_input",
      message: `shopping is not a supported top-level option for ${params.actor}.`,
    };
  }

  if ((params.location || params.uule) && !config.supportsGoogleLocation) {
    return {
      code: "invalid_input",
      message: `location and uule are only supported for scraper.aimode and scraper.overview.`,
    };
  }

  if (params.mode !== undefined && !config.supportsMode) {
    return {
      code: "invalid_input",
      message: `mode is only supported for scraper.copilot and scraper.grok.`,
    };
  }

  if (params.actor === "scraper.copilot" && params.mode !== undefined) {
    const allowedModes = ["search", "smart", "chat", "reasoning", "study"];
    if (!allowedModes.includes(params.mode)) {
      return {
        code: "invalid_input",
        message: `mode for scraper.copilot must be one of: ${allowedModes.join(", ")}.`,
      };
    }
  }

  if (params.actor === "scraper.grok" && params.mode !== undefined) {
    const allowedModes = [
      "MODEL_MODE_FAST",
      "MODEL_MODE_EXPERT",
      "MODEL_MODE_AUTO",
    ];
    if (!allowedModes.includes(params.mode)) {
      return {
        code: "invalid_input",
        message: `mode for scraper.grok must be one of: ${allowedModes.join(", ")}.`,
      };
    }
  }

  if (
    config.requiresMode &&
    params.mode === undefined
  ) {
    return {
      code: "invalid_input",
      message: `mode is required for ${params.actor}.`,
    };
  }

  return undefined;
}

function buildActorInput(params: LlmChatScraperParams, country: string) {
  const actorInput: Record<string, unknown> = {
    prompt: params.prompt,
    country,
  };

  if (params.web_search !== undefined) {
    actorInput.web_search = params.web_search;
  }

  if (params.shopping !== undefined) {
    actorInput.shopping = params.shopping;
  }

  if (params.mode !== undefined) {
    actorInput.mode = params.mode;
  }

  if (params.location) actorInput.location = params.location;
  if (params.uule) actorInput.uule = params.uule;

  return actorInput;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getStringField(source: unknown, field: string) {
  if (!isRecord(source)) return undefined;
  const value = source[field];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function extractTaskId(createResponse: unknown) {
  return getStringField(createResponse, "task_id");
}

function extractRequestId(createResponse: unknown) {
  return getStringField(createResponse, "request_id");
}

function extractTaskStatus(resultResponse: unknown) {
  return getStringField(resultResponse, "status")?.toLowerCase();
}

function extractTaskMessage(resultResponse: unknown) {
  return getStringField(resultResponse, "message");
}

function extractTaskResult(resultResponse: unknown) {
  return isRecord(resultResponse) ? resultResponse.task_result : undefined;
}

function pickActorResult(actor: Actor, result: unknown) {
  if (!isRecord(result)) return result;

  return RESULT_FIELDS_BY_ACTOR[actor].reduce<Record<string, unknown>>(
    (actorResult, field) => {
      if (field in result) actorResult[field] = result[field];
      return actorResult;
    },
    {}
  );
}

function formatPollHttpError(statusCode: number, responseData: unknown) {
  return {
    status_code: statusCode,
    code: "api_error",
    message:
      getStringField(responseData, "message") ||
      getStringField(responseData, "error") ||
      `LLM chat scraper result request failed with HTTP ${statusCode}.`,
    response: responseData,
  };
}

function formatTaskResultError(code: string, message: string, response: unknown) {
  return {
    code,
    message,
    response,
  };
}

async function pollTask(
  api: AxiosInstance,
  taskId: string,
  timeoutSeconds: number
): Promise<PollResult> {
  const startedAtMs = Date.now();
  const startedAt = new Date(startedAtMs).toISOString();
  const deadline = startedAtMs + timeoutSeconds * 1000;
  let latestResult: unknown;
  let latestStatus = "processing";
  let latestHttpStatus: number | undefined;

  while (true) {
    const response = await api.get(
      `${LLM_CHAT_SCRAPER_RESULT_ENDPOINT}/${encodeURIComponent(taskId)}`,
      {
        validateStatus: () => true,
      }
    );
    latestResult = response.data;
    latestHttpStatus = response.status;

    if (response.status === 429) {
      latestStatus = "rate_limited_retrying";
    } else if (response.status < 200 || response.status >= 300) {
      const finishedAtMs = Date.now();
      return {
        taskId,
        status: `http_${response.status}`,
        terminal: true,
        ok: false,
        timedOut: false,
        startedAt,
        finishedAt: new Date(finishedAtMs).toISOString(),
        elapsedMs: finishedAtMs - startedAtMs,
        latestResult,
        httpStatus: response.status,
        error: formatPollHttpError(response.status, response.data),
      };
    } else {
      const taskStatus = extractTaskStatus(response.data);

      if (taskStatus === "success") {
        const taskResult = extractTaskResult(response.data);
        const finishedAtMs = Date.now();

        if (!isRecord(taskResult)) {
          return {
            taskId,
            status: "invalid_response",
            terminal: true,
            ok: false,
            timedOut: false,
            startedAt,
            finishedAt: new Date(finishedAtMs).toISOString(),
            elapsedMs: finishedAtMs - startedAtMs,
            latestResult,
            httpStatus: response.status,
            error: formatTaskResultError(
              "invalid_response",
              "Scrapeless result response status is success but task_result is missing or is not an object.",
              response.data
            ),
          };
        }

        return {
          taskId,
          status: taskStatus,
          terminal: true,
          ok: true,
          timedOut: false,
          startedAt,
          finishedAt: new Date(finishedAtMs).toISOString(),
          elapsedMs: finishedAtMs - startedAtMs,
          latestResult,
          taskResult,
          httpStatus: response.status,
        };
      }

      if (taskStatus === "failed") {
        const finishedAtMs = Date.now();
        return {
          taskId,
          status: taskStatus,
          terminal: true,
          ok: false,
          timedOut: false,
          startedAt,
          finishedAt: new Date(finishedAtMs).toISOString(),
          elapsedMs: finishedAtMs - startedAtMs,
          latestResult,
          httpStatus: response.status,
          error: formatTaskResultError(
            "task_failed",
            extractTaskMessage(response.data) || "LLM chat scraper task failed.",
            response.data
          ),
        };
      }

      if (taskStatus === "pending" || taskStatus === "running") {
        latestStatus = taskStatus;
      } else {
        const finishedAtMs = Date.now();
        return {
          taskId,
          status: "invalid_response",
          terminal: true,
          ok: false,
          timedOut: false,
          startedAt,
          finishedAt: new Date(finishedAtMs).toISOString(),
          elapsedMs: finishedAtMs - startedAtMs,
          latestResult,
          httpStatus: response.status,
          error: formatTaskResultError(
            "invalid_response",
            "Scrapeless result response did not include a valid status: pending, running, success, or failed.",
            response.data
          ),
        };
      }
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      const finishedAtMs = Date.now();
      return {
        taskId,
        status: latestStatus,
        terminal: false,
        ok: false,
        timedOut: true,
        startedAt,
        finishedAt: new Date(finishedAtMs).toISOString(),
        elapsedMs: finishedAtMs - startedAtMs,
        latestResult,
        httpStatus: latestHttpStatus,
      };
    }

    await sleep(Math.min(POLL_INTERVAL_MS, remainingMs));
  }
}

function timeoutHelp(taskId: string) {
  return {
    message:
      "The LLM chat scraper task did not finish before the timeout. Fetch the result manually with the Scrapeless API.",
    manual_result_request: {
      method: "GET",
      url: `${BASE_URL}${LLM_CHAT_SCRAPER_RESULT_ENDPOINT}/${taskId}`,
      headers: {
        "x-api-token": "YOUR_SCRAPELESS_KEY",
      },
    },
  };
}

function formatApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;
    return {
      status_code: statusCode,
      code: statusCode === 429 ? "rate_limited" : "api_error",
      message:
        getStringField(responseData, "message") ||
        getStringField(responseData, "error") ||
        error.message,
      response: responseData,
    };
  }

  return {
    code: "unknown_error",
    message: (error as Error).message,
  };
}

export const llmChatScraper = defineTool({
  name: "llm_chat_scraper",
  description: `Create an LLM Chat Scraper task for an explicit Scrapeless actor, then poll every 5 seconds until the answer is ready or the timeout is reached.
    Supports ChatGPT, Gemini, Perplexity, Copilot, Google AI Mode, Google AI Overview, Grok, and Alexa.
    Defaults to a 3 minute timeout. The timeout can be set from 60 to 600 seconds.
    On timeout, returns the task_id and instructions for manually fetching the result.`,
  inputSchema: llmChatScraperSchema.shape,
  handle: async (rawParams, client, headers) => {
    const params = llmChatScraperSchema.parse(rawParams);
    const country = normalizeCountry(params.country);
    const actorConfig = ACTOR_CONFIG[params.actor];
    const startedAtMs = Date.now();
    const startedAt = new Date(startedAtMs).toISOString();
    const validationError = validateActorParams(params);

    if (validationError) {
      return textResponse({
        status: "failed",
        actor: params.actor,
        actor_display_name: actorConfig.displayName,
        error: validationError,
      });
    }

    const actorInput = buildActorInput(params, country);
    const taskRequest: Record<string, unknown> = {
      actor: params.actor,
      input: actorInput,
    };

    if (params.webhook) {
      taskRequest.webhook = params.webhook;
    }

    let taskId: string | undefined;
    let requestId: string | undefined;
    let createResponseBody: unknown;

    try {
      const api = getLlmChatScraperApi(client, headers);
      const createResponse = await api.post(
        LLM_CHAT_SCRAPER_REQUEST_ENDPOINT,
        taskRequest
      );

      createResponseBody = createResponse.data;
      taskId = extractTaskId(createResponseBody);
      requestId = extractRequestId(createResponseBody);

      if (!taskId) {
        return textResponse({
          status: "failed",
          actor: params.actor,
          actor_display_name: actorConfig.displayName,
          request_id: requestId,
          error: {
            code: "missing_task_id",
            message:
              "Scrapeless did not return a task id from /api/v2/scraper/request.",
          },
          create_response: createResponseBody,
        });
      }

      const pollResult = await pollTask(api, taskId, params.timeout_seconds);
      const finishedAtMs = Date.now();

      if (pollResult.timedOut) {
        return textResponse({
          status: "timeout",
          task_id: taskId,
          request_id: requestId,
          actor: params.actor,
          actor_display_name: actorConfig.displayName,
          timeout_seconds: params.timeout_seconds,
          poll_interval_seconds: POLL_INTERVAL_MS / 1000,
          execution_time: {
            started_at: startedAt,
            finished_at: new Date(finishedAtMs).toISOString(),
            elapsed_ms: finishedAtMs - startedAtMs,
          },
          latest_status: pollResult.status,
          latest_http_status: pollResult.httpStatus,
          latest_result: pollResult.latestResult,
          help: timeoutHelp(taskId),
          create_response: createResponseBody,
        });
      }

      if (!pollResult.ok) {
        return textResponse({
          status: "failed",
          task_id: taskId,
          request_id: requestId,
          actor: params.actor,
          actor_display_name: actorConfig.displayName,
          timeout_seconds: params.timeout_seconds,
          poll_interval_seconds: POLL_INTERVAL_MS / 1000,
          execution_time: {
            started_at: startedAt,
            finished_at: new Date(finishedAtMs).toISOString(),
            elapsed_ms: finishedAtMs - startedAtMs,
          },
          task_status: pollResult.status,
          result_http_status: pollResult.httpStatus,
          error: pollResult.error,
          latest_result: pollResult.latestResult,
          create_response: createResponseBody,
        });
      }

      return textResponse({
        status: "completed",
        task_id: taskId,
        request_id: requestId,
        actor: params.actor,
        actor_display_name: actorConfig.displayName,
        timeout_seconds: params.timeout_seconds,
        poll_interval_seconds: POLL_INTERVAL_MS / 1000,
        execution_time: {
          started_at: startedAt,
          finished_at: new Date(finishedAtMs).toISOString(),
          elapsed_ms: finishedAtMs - startedAtMs,
        },
        task_status: pollResult.status,
        result_http_status: pollResult.httpStatus,
        result: pickActorResult(params.actor, pollResult.taskResult),
        create_response: createResponseBody,
      });
    } catch (error) {
      const finishedAtMs = Date.now();
      return textResponse({
        status: "failed",
        task_id: taskId,
        request_id: requestId,
        actor: params.actor,
        actor_display_name: actorConfig.displayName,
        execution_time: {
          started_at: startedAt,
          finished_at: new Date(finishedAtMs).toISOString(),
          elapsed_ms: finishedAtMs - startedAtMs,
        },
        error: formatApiError(error),
        help: taskId ? timeoutHelp(taskId) : undefined,
        create_response: createResponseBody,
      });
    }
  },
});
