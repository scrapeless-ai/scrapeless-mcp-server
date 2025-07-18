import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ScrapelessClient } from "@scrapeless-ai/sdk";
import z, { ZodRawShape, ZodTypeAny } from "zod";
import { customAlphabet } from "nanoid";
import { Context } from "../context.js";

import type { Page, SerializedAXNode } from 'puppeteer-core';

type InputType = ZodRawShape;

const notRecordRoleList = [
  'Page Title',
  'Root Web Area',
  'RootWebArea',
  'generic',
  'none',
  'paragraph',
  'InlineTextBox',
  'image'
]

function assembleSnapshot(snap: SerializedAXNode, indent = 0) {
  let str = '';
  const spaces = ' '.repeat(indent);

  for (const child of snap.children || []) {
    if (child.role === 'Page Title') continue;
    if (child.role === 'Root Web Area') continue;
    if (!notRecordRoleList.includes(child.role)) {
      str += `${spaces}- ${child.role}: ${child.name}\n`;
    }
    if (child.role === 'image') {
      str += `${spaces} - image\n`;
    }

    if (child.children && child.children.length > 0) {
      str += assembleSnapshot(child, !notRecordRoleList.includes(child.role) ? indent + 2 : indent);
    }
  }

  return str;
}


export type Tool<Input extends InputType = InputType> = {
  name: string;
  description: string;
  inputSchema: Input;
  handle: (
    params: z.objectOutputType<Input, ZodTypeAny>,
    client: ScrapelessClient,
    headers?: Record<string, string>
  ) => Promise<CallToolResult>;
};

export type BrowserTool<Input extends InputType = InputType> = {
  name: string;
  description: string;
  inputSchema: Input;
  handle?: (
    context: Context,
    params: z.objectOutputType<Input, ZodTypeAny>,
    headers?: Record<string, string>
  ) => Promise<CallToolResult>;
};

export function defineTool<
  Input extends InputType,
  R extends Tool<Input> | BrowserTool<Input> = Tool<Input>
>(tool: R): R {
  return tool;
}

export async function wrapMcpResponse<T>(
  request: () => Promise<T>
): Promise<CallToolResult> {
  try {
    const data = await request();
    return {
      content: [
        {
          type: "text",
          text: `Response:\n\n${JSON.stringify(data)}`,
        },
      ],
    };
  } catch (error) {
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

export function wrapMcpBrowserResponse(content: string): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}

export function uuid() {
  const nanoid1 = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 4);
  const nanoid2 = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 4);
  const nanoid3 = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 4);
  const nanoid4 = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);
  return `${nanoid1()}-${nanoid2()}-${nanoid3()}-${nanoid4()}`;
}

export async function snapshot(page: Page) {
  const snap = await page.accessibility.snapshot({ interestingOnly: false, includeIframes: true });
  if (!snap) {
    return "No accessibility snapshot available.";
  }
  const url = page.url();
  const title = await page.title();

  let snapshotString = `- Page URL: ${url}\n`;
  snapshotString += `- Page Title: ${title}\n`;
  snapshotString += `\`\`\`yaml\n- Page Snapshot\n\`\`\`yaml`;
  return snapshotString + assembleSnapshot(snap, 0);
}
