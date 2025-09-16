import { Scrapeless } from "@scrapeless-ai/sdk";
import { getParamValue } from "@chatmcp/sdk/utils/index.js";
import puppeteer from "puppeteer-core";

import type { Browser, Page } from "puppeteer-core";

export interface BrowserSession {
  browser: Browser | null;
  page: Page | null;
  closed: boolean;
}

export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, BrowserSession>;

  private constructor() {
    this.sessions = new Map<string, BrowserSession>();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async createSession(
    id: string,
    apiKey: string,
    headers?: Record<string, string>
  ) {
    if (!this.sessions.has(id)) {
      this.sessions.set(id, { browser: null, page: null, closed: true });
    }

    const scrapelessClient = new Scrapeless({ apiKey });

    const session = this.sessions.get(id) as BrowserSession;
    const { browserWSEndpoint } = scrapelessClient.browser.create({
      session_ttl: Number(
        process.env.BROWSER_SESSION_TTL ||
          getParamValue("BROWSER_SESSION_TTL") ||
          headers?.["x-browser-session-ttl"] ||
          30000
      ),
      profile_id:
        process.env.BROWSER_PROFILE_ID ||
        getParamValue("BROWSER_PROFILE_ID") ||
        headers?.["x-browser-profile-id"] ||
        "",
      profile_persist: Boolean(
        process.env.BROWSER_PROFILE_PERSIST ||
          getParamValue("BROWSER_PROFILE_PERSIST") ||
          headers?.["x-browser-profile-persist"]
      ),
    });
    const browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null,
    });
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    browser.on("disconnected", () => {
      session.closed = true;
      session.browser = null;
      session.page = null;
      this.sessions.delete(id);
    });

    session.browser = browser;
    session.page = page;
    session.closed = false;

    return session;
  }

  getSession(id: string) {
    if (!this.sessions.has(id)) return null;

    const session = this.sessions.get(id) as BrowserSession;

    if (!session.browser || !session.browser?.connected) {
      session.browser = null;
      session.page = null;
      session.closed = true;
      this.sessions.delete(id);
      return null;
    }

    return session;
  }

  async closeSession(id: string) {
    const session = this.sessions.get(id) as BrowserSession;

    if (session) {
      session.page?.close().catch(() => {});
      session.browser?.disconnect().catch(() => {});
      session.closed = true;
      session.browser = null;
      session.page = null;
      this.sessions.delete(id);
    }
  }
}
