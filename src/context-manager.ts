import { Context } from "./context.js";
import { API_KEY } from "./config.js";

export class ContextManager {
  private static instance: ContextManager;
  private contexts: Map<string, Context>;

  private constructor() {
    this.contexts = new Map<string, Context>();
  }

  public static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  public getContext(apiKey?: string): Context {
    const key = apiKey ?? API_KEY;

    if (!this.contexts.has(key)) {
      console.log(
        `Creating new Context for API key: ${key?.substring(0, 8)}...`
      );
      this.contexts.set(key, new Context(key));
    } else {
      console.log(
        `Reusing existing Context for API key: ${key?.substring(0, 8)}...`
      );
    }

    return this.contexts.get(key)!;
  }

  public clearContext(apiKey?: string): void {
    const key = apiKey ?? API_KEY;
    if (this.contexts.has(key)) {
      this.contexts.delete(key);
      console.log(`Cleared Context for API key: ${key?.substring(0, 8)}...`);
    }
  }

  public clearAllContexts(): void {
    this.contexts.clear();
    console.log("Cleared all Contexts");
  }

  public getContextCount(): number {
    return this.contexts.size;
  }
}
