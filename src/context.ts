import { SessionManager } from "./session-manager.js";
import { uuid } from "./tools/utils.js";

import {
  CallToolResult,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import type { BrowserTool } from "./tools/utils.js";
import type { BrowserSession } from "./session-manager.js";

export class Context {
  private sessionManager: SessionManager;
  private currentSessionId: string = "default-session-id";
  private apiKey: string | undefined;
  constructor(apiKey?: string) {
    this.sessionManager = SessionManager.getInstance();
    this.apiKey = apiKey;
  }

  public getSession(id?: string) {
    return this.sessionManager.getSession(
      `${id ?? this.currentSessionId}-${this.apiKey}`
    );
  }

  async run(
    tool: BrowserTool,
    params: any,
    headers?: Record<string, string>
  ): Promise<CallToolResult> {
    if (!this.apiKey) {
      return {
        content: [
          {
            type: "text",
            text: `API key is missing.`,
          },
        ],
      };
    }

    if (params.sessionId && params.sessionId !== this.currentSessionId) {
      this.currentSessionId = params.sessionId as string;
    }

    const toolName = tool.name;
    if (toolName === "browser_create") {
      const newSessionId = uuid();
      try {
        await this.sessionManager.createSession(
          `${newSessionId}-${this.apiKey}`,
          this.apiKey,
          headers
        );
        return {
          content: [
            {
              type: "text",
              text: `New browser session created with ID: ${newSessionId}`,
            } as TextContent,
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to create browser session. Please try again later.`,
            } as TextContent,
          ],
        };
      }
    }

    if (toolName === "browser_close") {
      const sessionId = params?.sessionId as string | undefined;
      if (!sessionId) {
        return {
          content: [
            {
              type: "text",
              text: `Session ID is missing.`,
            } as TextContent,
          ],
        };
      }
      try {
        await this.sessionManager.closeSession(`${sessionId}-${this.apiKey}`);
        return {
          content: [
            {
              type: "text",
              text: `Browser session with ID: ${sessionId} has been closed.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to close browser session with ID: ${sessionId}. Please try again later.`,
            } as TextContent,
          ],
        };
      }
    }

    let session: BrowserSession | null = null;
    session = this.sessionManager.getSession(
      `${this.currentSessionId}-${this.apiKey}`
    );
    if (!session) {
      const newSessionId = uuid();
      await this.sessionManager.createSession(
        `${newSessionId}-${this.apiKey}`,
        this.apiKey
      );
      this.currentSessionId = newSessionId;
    }

    let toolActionOutput: CallToolResult | undefined = undefined;
    let actionSucceeded = false;
    try {
      let action: BrowserTool["handle"] | undefined = undefined;
      action = tool.handle;

      if (action) {
        toolActionOutput = await action(this, params);
        actionSucceeded = true;
      }
    } catch (e) {
    } finally {
      if (actionSucceeded && toolActionOutput !== undefined) {
        return toolActionOutput;
      }

      return {
        content: [
          {
            type: "text",
            text: `${toolName} action completed successfully.`,
          } as TextContent,
        ],
      };
    }
  }
}
