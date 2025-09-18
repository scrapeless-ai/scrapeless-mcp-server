import { z } from "zod";
import {
  BrowserTool,
  defineTool,
  wrapMcpBrowserResponse,
  snapshot,
} from "../utils.js";
import { Context } from "../../context.js";

export const browserCreate = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_create",
  description:
    "Create or reuse a cloud browser session using Scrapeless. Updates the active session.",
  inputSchema: {
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, a new session is created."
      ),
  },
});

export const browserClose = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_close",
  description:
    "Closes the current session by disconnecting the cloud browser. This will terminate the recording for the session.",
  inputSchema: {
    sessionId: z
      .string()
      .describe(
        "The session ID to identify target browser. If not provided or invalid, you cannot close the session."
      ),
  },
});

export const browserGoto = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_goto",
  description: `Navigate browser to a specified URL.
    Restrictions: Only for direct URL navigation, not for searches.
    Valid: Go to https://google.com.
    Invalid: Search for "cats" on Google (use google_search).`,
  inputSchema: {
    url: z
      .string()
      .url()
      .describe("The URL to navigate to in the browser session."),
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    await session.page.goto(params.url);
    const accessibilitySnapshot = await snapshot(session.page);

    return {
      content: [
        {
          type: "text",
          text: accessibilitySnapshot,
        },
      ],
    };
  },
});

export const browserGoBack = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_go_back",
  description: `Go back one step in browser history.
    Restrictions: Only works if a previous page exists in the session history.
    Valid: After navigating from page A to B, go back to A.
    Invalid: Attempting to go back on the first page of a session.`,
  inputSchema: {
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    await session.page.goBack();
    const accessibilitySnapshot = await snapshot(session.page);

    return {
      content: [
        {
          type: "text",
          text: accessibilitySnapshot,
        },
      ],
    };
  },
});

export const browserGoForward = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_go_forward",
  description: `Go forward one step in browser history.
    Restrictions: Only works after a "go_back" action has been performed.
    Valid: After going back from page B to A, go forward to B.
    Invalid: Attempting to go forward without a preceding "go_back" action.`,
  inputSchema: {
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    await session.page.goForward();
    const accessibilitySnapshot = await snapshot(session.page);

    return {
      content: [
        {
          type: "text",
          text: accessibilitySnapshot,
        },
      ],
    };
  },
});

export const browserClick = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_click",
  description: `Click a specific element on the page.
    Restrictions: Requires a valid CSS selector for the target element.
    Valid: Click the button with selector "#submit-button".
    Invalid: Click "the login button" without providing a selector.`,
  inputSchema: {
    selector: z.string().describe("The CSS selector of the element to click."),
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      await session.page.click(params.selector);
      const accessibilitySnapshot = await snapshot(session.page);
      return {
        content: [
          {
            type: "text",
            text: accessibilitySnapshot,
          },
        ],
      };
    } catch (error) {
      return wrapMcpBrowserResponse(
        `Failed to click on element: ${(error as Error).message}`
      );
    }
  },
});

export const browserType = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_type",
  description: `Type text into a specified input field.
    Restrictions: Requires a CSS selector for an input/textarea and the text to type.
    Valid: Type "hello world" into input "[name='q']".
    Invalid: Type "hello world" without specifying a target field.`,
  inputSchema: {
    selector: z.string().describe("CSS selector for the element to type into."),
    text: z.string().describe("Text to type."),
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      await session.page.type(params.selector, params.text);
      const accessibilitySnapshot = await snapshot(session.page);
      return {
        content: [
          {
            type: "text",
            text: accessibilitySnapshot,
          },
        ],
      };
    } catch (error) {
      return wrapMcpBrowserResponse(
        `Failed to type into element: ${(error as Error).message}`
      );
    }
  },
});

export const browserWaitFor = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_wait_for",
  description: `Wait for a specific page element to appear.
    Restrictions: Requires a valid CSS selector for the element to wait for.
    Valid: Wait for the element "#results" to become visible.
    Invalid: Wait for "the results to load" without a selector.`,
  inputSchema: {
    selector: z.string().describe("CSS selector of the element to wait for."),
    timeout: z
      .number()
      .optional()
      .describe("Maximum time to wait in milliseconds (default: 30000)."),
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      await session.page.waitForSelector(params.selector, {
        timeout: params.timeout ?? 30000,
      });
      return wrapMcpBrowserResponse(
        `Successfully waited for element ${params.selector}`
      );
    } catch (error) {
      return wrapMcpBrowserResponse(
        `Failed to wait for condition: ${(error as Error).message}`
      );
    }
  },
});

export const browserWait = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_wait",
  description: `Pause execution for a fixed duration.
    Restrictions: Requires a duration in milliseconds. Should be used sparingly.
    Valid: Wait for 2000 milliseconds.
    Invalid: Wait for a page to finish loading (use "browser_wait_for")`,
  inputSchema: {
    time: z
      .number()
      .int()
      .positive()
      .describe("Time to wait in milliseconds (default: 30000)."),
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    await new Promise((resolve) => setTimeout(resolve, params.time ?? 30000));

    return wrapMcpBrowserResponse(
      `Waited for ${params.time ?? 30000} milliseconds`
    );
  },
});

export const browserSnapshot = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_snapshot",
  description: `Capture the complete structure of a webpage, including DOM and resources, for inspection and analysis.`,
  inputSchema: {
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      const accessibilitySnapshot = await snapshot(session.page);

      return {
        content: [
          {
            type: "text",
            text: accessibilitySnapshot,
          },
        ],
      };
    } catch (error) {
      return {
        content: [],
      };
    }
  },
});

export const browserScreenshot = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_screenshot",
  description: `Capture a screenshot of the current page.
    Restrictions: Can capture either the full page or the visible viewport.
    Valid: Take a screenshot of the current browser view.
    Invalid: Capture a screenshot of a specific element (not supported).`,
  inputSchema: {
    fullPage: z
      .boolean()
      .optional()
      .describe(
        [
          "Whether to screenshot the full page (default: false)",
          "You should avoid fullscreen if it's not important, since the " +
            "images can be quite large",
        ].join("\n")
      ),
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      const screenshot = await session.page.screenshot({
        fullPage: params.fullPage ?? false,
      });
      const accessibilitySnapshot = await snapshot(session.page);

      return {
        content: [
          {
            type: "image",
            // @ts-ignore
            data: screenshot.toString("base64"),
            mimeType: "image/png",
          },
          {
            type: "text",
            text: accessibilitySnapshot,
          },
        ],
      };
    } catch (error) {
      return {
        content: [],
      };
    }
  },
});

export const browserGetHtml = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_get_html",
  description: `Get the full HTML of the current page.
    Restrictions: Returns the entire raw HTML source code.
    Valid: Get the HTML of the current page to parse its structure.
    Invalid: Get only the visible text (use "browser_get_text")`,
  inputSchema: {
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      const html = await session.page.content();
      return wrapMcpBrowserResponse(html);
    } catch (error) {
      return wrapMcpBrowserResponse(
        `Failed to retrieve HTML content: ${(error as Error).message}`
      );
    }
  },
});

export const browserGetText = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_get_text",
  description: `Get all visible text from the current page.
    Restrictions: Extracts only text content, ignoring HTML tags.
    Valid: Get the text content of the current page for summarization.
    Invalid: Get the page's HTML structure (use "browser_get_html")`,
  inputSchema: {
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      const text = await session.page.evaluate(() => document.body.innerText);
      return wrapMcpBrowserResponse(text);
    } catch (error) {
      return wrapMcpBrowserResponse(
        `Failed to retrieve text content: ${(error as Error).message}`
      );
    }
  },
});

export const browserScroll = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_scroll",
  description: `Scroll the current page to a specific position.
    Restrictions: Requires pixel coordinates for scrolling.
    Valid: Scroll to the bottom of the page (e.g., { x: 0, y: 10000 }).
    Invalid: Scroll to "the top" without specifying coordinates.`,
  inputSchema: {
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      await session.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      const accessibilitySnapshot = await snapshot(session.page);
      return {
        content: [
          {
            type: "text",
            text: accessibilitySnapshot,
          },
        ],
      };
    } catch (error) {
      return wrapMcpBrowserResponse(
        `Failed to scroll page: ${(error as Error).message}`
      );
    }
  },
});

export const browserScrollTo = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_scroll_to",
  description: `Scroll a specific element into view.
    Restrictions: Requires a valid CSS selector for the target element.
    Valid: Scroll to the element "#footer".
    Invalid: Scroll to the bottom of the page (use "browser_scroll").`,
  inputSchema: {
    x: z.number().describe("X coordinate to scroll to."),
    y: z.number().describe("Y coordinate to scroll to."),
    sessionId: z
      .string()
      .optional()
      .describe(
        "Optional session ID to use/reuse. If not provided or invalid, the active session is used."
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      await session.page.evaluate(
        (x, y) => {
          window.scrollTo(x, y);
        },
        params.x,
        params.y
      );
      const accessibilitySnapshot = await snapshot(session.page);
      return {
        content: [
          {
            type: "text",
            text: accessibilitySnapshot,
          },
        ],
      };
    } catch (error) {
      return wrapMcpBrowserResponse(
        `Failed to scroll page: ${(error as Error).message}`
      );
    }
  },
});

export const browserPressKey = defineTool<z.ZodRawShape, BrowserTool>({
  name: "browser_press_key",
  description: `Simulate a key press.
    Restrictions: Must specify a valid key name; optional target selector.
    Valid: Press Enter in #search.
    Invalid: Press a key without specifying the key name.`,
  inputSchema: {
    selector: z
      .string()
      .describe("The CSS selector of the element to focus.")
      .optional(),
    key: z
      .string()
      .describe(
        "Name of the key to press or a character to generate, such as `ArrowLeft` or `a`"
      ),
  },
  handle: async (context: Context, params) => {
    const session = context.getSession(params.sessionId);
    if (!session?.page) {
      return wrapMcpBrowserResponse(
        "No active browser session found. Please create a browser session first."
      );
    }

    try {
      if (params.selector) {
        await session.page.focus(params.selector);
      }
      await session.page.keyboard.press(params.key);
      const accessibilitySnapshot = await snapshot(session.page);
      return {
        content: [
          {
            type: "text",
            text: accessibilitySnapshot,
          },
        ],
      };
    } catch (error) {
      return wrapMcpBrowserResponse(
        `Failed to press key: ${(error as Error).message}`
      );
    }
  },
});
