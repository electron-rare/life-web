/* @vitest-environment node */

import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { once } from "node:events";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { build, mergeConfig } from "vite";
import { afterEach, describe, expect, it } from "vitest";
import viteConfig from "../../vite.config";

type RunningServer = {
  server: Server;
  origin: string;
};

async function startServer(handler: (req: IncomingMessage, res: ServerResponse) => void): Promise<RunningServer> {
  const server = createServer(handler as never);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start test server");
  }
  return {
    server,
    origin: `http://127.0.0.1:${address.port}`,
  };
}

async function stopServer(server?: Server) {
  if (!server) return;
  await new Promise<void>((resolveClose, rejectClose) => {
    server.close((error) => {
      if (error) rejectClose(error);
      else resolveClose();
    });
  });
}

async function waitFor(check: () => boolean, timeoutMs = 10_000) {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timed out while waiting for smoke assertions");
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
  }
}

describe("life-web bundle runtime smoke", () => {
  let apiServer: Server | undefined;
  let appServer: Server | undefined;

  afterEach(async () => {
    await stopServer(appServer);
    await stopServer(apiServer);
    appServer = undefined;
    apiServer = undefined;
  });

  it("builds a production bundle that calls the gateway host for governance data", { timeout: 30_000 }, async () => {
    const apiRequests: string[] = [];
    const runtimeFetches: string[] = [];

    const apiRuntime = await startServer((req: IncomingMessage, res: ServerResponse) => {
      apiRequests.push(req.url || "");
      res.setHeader("Content-Type", "application/json");

      if (req.url === "/api/audit/status") {
        res.end(JSON.stringify({
          last_run: "2026-04-03T12:00:00Z",
          total_audits: 2,
          pass: 1,
          warn: 1,
          fail: 0,
        }));
        return;
      }

      if (req.url === "/api/audit/report") {
        res.end(JSON.stringify({
          timestamp: "2026-04-03T12:00:00Z",
          total_files: 2,
          summary: { pass: 1, warn: 1, fail: 0 },
          results: [
            { filepath: "/tmp/demo-audit.md", status: "warn", errors: 0, warnings: 1, details: [] },
          ],
        }));
        return;
      }

      res.statusCode = 404;
      res.end(JSON.stringify({ error: "not found" }));
    });
    apiServer = apiRuntime.server;

    const outDir = mkdtempSync(join(tmpdir(), "life-web-runtime-smoke-"));
    await build(mergeConfig(viteConfig, {
      logLevel: "silent",
      define: {
        "import.meta.env.VITE_API_URL": JSON.stringify(apiRuntime.origin),
      },
      build: {
        outDir,
        emptyOutDir: true,
      },
    }));

    const html = readFileSync(join(outDir, "index.html"), "utf8");
    const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
    if (!scriptMatch) {
      throw new Error("Unable to locate the built entry script");
    }

    const appRuntime = await startServer((req: IncomingMessage, res: ServerResponse) => {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
    });
    appServer = appRuntime.server;

    const dom = new JSDOM(html, {
      url: `${appRuntime.origin}/governance`,
      pretendToBeVisual: true,
    });

    const { window } = dom;
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: () => {},
    });

    const originalGlobals = new Map<string, unknown>();
    const nativeFetch = globalThis.fetch.bind(globalThis);
    const runtimeFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      runtimeFetches.push(url);
      return nativeFetch(input, init);
    };

    for (const key of [
      "self",
      "window",
      "document",
      "navigator",
      "location",
      "history",
      "HTMLElement",
      "SVGElement",
      "Node",
      "MutationObserver",
      "CustomEvent",
      "Event",
      "Request",
      "Response",
      "Headers",
      "fetch",
      "localStorage",
      "sessionStorage",
      "getComputedStyle",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "matchMedia",
      "scrollTo",
    ]) {
      originalGlobals.set(key, (globalThis as Record<string, unknown>)[key]);
    }

    const nextGlobals: Record<string, unknown> = {
      self: window,
      window,
      document: window.document,
      navigator: window.navigator,
      location: window.location,
      history: window.history,
      HTMLElement: window.HTMLElement,
      SVGElement: window.SVGElement,
      Node: window.Node,
      MutationObserver: window.MutationObserver,
      CustomEvent: window.CustomEvent,
      Event: window.Event,
      Request,
      Response,
      Headers,
      fetch: runtimeFetch,
      localStorage: window.localStorage,
      sessionStorage: window.sessionStorage,
      getComputedStyle: window.getComputedStyle.bind(window),
      requestAnimationFrame: window.requestAnimationFrame.bind(window),
      cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
      matchMedia: window.matchMedia?.bind(window) ?? (() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })),
      scrollTo: window.scrollTo.bind(window),
    };

    for (const [key, value] of Object.entries(nextGlobals)) {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: true,
        value,
      });
    }

    try {
      const entryFile = resolve(outDir, scriptMatch[1].replace(/^\//, ""));
      await import(pathToFileURL(entryFile).href);

      await waitFor(() => {
        const text = window.document.body.textContent || "";
        return text.includes("Pass") && text.includes("demo-audit.md");
      });
    } finally {
      for (const [key, value] of originalGlobals.entries()) {
        Object.defineProperty(globalThis, key, {
          configurable: true,
          writable: true,
          value,
        });
      }
      window.close();
    }

    expect(apiRequests).toContain("/api/audit/status");
    expect(apiRequests).toContain("/api/audit/report");
    const apiFetches = runtimeFetches.filter((url) => url.includes("/api/"));
    expect(apiFetches.length).toBeGreaterThan(0);
    expect(runtimeFetches.some((url) => url.includes("localhost:8000"))).toBe(false);
    expect(runtimeFetches.some((url) => url.startsWith(`${appRuntime.origin}/api`))).toBe(false);
    expect(apiFetches.every((url) => url.startsWith(apiRuntime.origin))).toBe(true);
  });
});
