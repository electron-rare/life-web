declare module "jsdom" {
  export class JSDOM {
    constructor(html?: string | Buffer | ArrayBuffer | ArrayBufferView, options?: Record<string, unknown>);
    window: Window & typeof globalThis;
  }
}
