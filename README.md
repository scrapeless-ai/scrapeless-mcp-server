![preview](./banner.png)

# Scrapeless MCP Server

Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools. MCP provides a standardized way to connect LLM with the required context, helping you efficiently enhance chat interfaces, build AI-driven IDEs, or create custom AI workflows.

Seamlessly integrate real-time Google SERP(Google Search, Google Flight, Google Map, Google Jobs....) results into your LLM applications using the Scrapeless MCP server. This server acts as a bridge between LLMs (like ChatGPT, Claude, etc.) and Scrapeless's Google SERP, enabling dynamic context retrieval for AI workflows, chatbots, and research tools.

👉 Live MCP Endpoint:

- [mcp.so](https://mcp.so/server/scrapelessMcpServer/scrapeless-ai)
- [glama.ai](https://glama.ai/mcp/servers/@scrapeless-ai/scrapeless-mcp-server)

📦 NPM Package: [scrapeless-mcp-server](https://www.npmjs.com/package/scrapeless-mcp-server)

## Overview

This project provides several MCP servers that enable AI assistants like Claude to perform various search operations and retrieve data from:

- Google Search

## Supported Transport Protocols

- **Stdio** `default`: The transport runs locally on your machine and communicates via standard input/output streams.
- **Streamable HTTP** `--mode=streamable_http`: The new MCP transport protocol that simplifies client-server communication through a single HTTP endpoint

## Tools

### Browser Tools

- `browser_goto`
  Navigate browser to a specified URL.

- `browser_go_back`
  Go back one step in browser history.

- `browser_go_forward`
  Go forward one step in browser history.

- `browser_click`
  Click a specific element on the page.

- `browser_type`
  Type text into a specified input field.

- `browser_wait_for`
  Wait for a specific page element to appear.

- `browser_wait`
  Pause execution for a fixed duration.

- `browser_screenshot`
  Capture a screenshot of the current page.

- `browser_get_html`
  Get the full HTML of the current page.

- `browser_get_text`
  Get all visible text from the current page.

- `browser_scroll`
  Scroll to the bottom of the page.

- `browser_scroll_to`
  Scroll a specific element into view.

### Universal Tools

- `scrape_html`
  Scrape a URL and return its full HTML content.
- `scrape_markdown`
  Scrape a URL and return its content as Markdown.

- `scrape_screenshot`
  Capture a high-quality screenshot of any webpage.

### Deep SerpAPI Tools

- `google_search`
  universal information search engine.retrieves any data information.explanatory queries (why, how).comparative analysis requests.
- `google_scholar`
  Search for academic papers on Google Scholar.

- `google_flights`
  Exclusive flight information query tool.

- `google_trends`
  Get trending search data from Google Trends.

## Setup Guide

### 1. Get Scrapeless Key

1. Register at [Scrapeless](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=mcp)
2. [Get your free trial](https://app.scrapeless.com/landing/guide?utm_source=github&utm_medium=mcp)
3. [Generate API Key](https://app.scrapeless.com/dashboard/settings/api-key?utm_source=github&utm_medium=mcp)

### 2. Configure

#### Stdio

```json
{
  "mcpServers": {
    "Scrapeless MCP Server": {
      "command": "npx",
      "args": ["-y", "scrapeless-mcp-server"],
      "env": {
        "SCRAPELESS_KEY": "YOUR_SCRAPELESS_KEY"
      }
    }
  }
}
```

#### Streamable

1. Run locally

```shell
npx scrapeless-mcp-server --mode=streamable_http --SCRAPELESS_KEY=YOUR_SCRAPELESS_KEY
```

2. Add mcp configuration

```json
{
  "mcpServers": {
    "Scrapeless MCP Server": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:9593/mcp",
      "disabled": false
    }
  }
}
```

## Example Queries

Here are some examples of how to use these servers with Claude Desktop:

### browser

Use a browser to visit chatgpt.com, search for "What's the weather like today?", and summarize the results.

### scrape_html

Scrape the html content of scrapeless.com page

### scrape_markdown

Scrape the markdown content of scrapeless.com page

### scrape_screenshot

Get screenshots of scrapeless.com

### google_flights

Please help me with my flight ticket from Chicago to New York on November 20, 2025

### google_scholar

Find papers by "Yoshua Bengio" on deep learning

### google_search

Search scrapeless by google search

### google_trends

Find the search interest for "AI" over the last year

## Installation

### Prerequisites

- Node.js 22 or higher
- NPM or Yarn

### Install from Source

1. Clone the repository:

```bash
git clone https://github.com/scrapeless-ai/scrapeless-mcp-server.git
cd scrapeless-mcp-server
```

2. Install dependencies:

```bash
npm install
```

3. Build the server:

```bash
npm run build
```

## Community

- [MCP Server Discord](https://backend.scrapeless.com/app/api/v1/public/links/discord)
