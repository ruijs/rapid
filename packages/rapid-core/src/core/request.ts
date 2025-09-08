import qs from "qs";
import { parseFormDataBody } from "./http/formDataParser";
import { getCookies } from "~/deno-std/http/cookie";
import { IRpdServer } from "./server";
import { Logger } from "~/facilities/log/LogFacility";

export const GlobalRequest = global.Request;

export interface RapidRequestBody {
  type: "form-data" | "json" | "form";
  value: any;
}

export class RapidRequest {
  #logger: Logger;
  #raw: Request;
  #bodyParsed: boolean;
  #body: RapidRequestBody;
  #headers: Headers;
  #parsedCookies: Record<string, string>;
  method: string;
  url: URL;
  ip?: string;

  constructor(server: IRpdServer, req: Request) {
    this.#logger = server.getLogger();
    this.#raw = req;
    this.method = req.method;
    this.url = new URL(req.url);
    this.#headers = req.headers;
  }

  async parseBody(): Promise<void> {
    if (this.#bodyParsed) {
      this.#logger.warn("Request body has been parsed. 'parseBody()' method should not be called more than once.");
      return;
    }

    const requestMethod = this.method;
    if (requestMethod !== "POST" && requestMethod !== "PUT" && requestMethod !== "PATCH") {
      this.#body = null;
      this.#bodyParsed = true;
      return;
    }

    const contentLength = parseInt(this.#headers.get("Content-Length") || "0", 10);
    if (!contentLength) {
      this.#body = null;
      this.#bodyParsed = true;
      return;
    }

    const req = this.#raw;
    const contentType = this.#headers.get("Content-Type") || "application/json";
    if (contentType.includes("json")) {
      this.#body = {
        type: "json",
        value: await req.json(),
      };
    } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
      const bodyText = await req.text();
      this.#body = {
        type: "form",
        value: qs.parse(bodyText),
      };
    } else if (contentType.startsWith("multipart/form-data")) {
      this.#body = {
        type: "form-data",
        value: await parseFormDataBody(req, { all: true }),
      };
    }
    this.#bodyParsed = true;
  }

  get rawRequest(): Request {
    return this.#raw;
  }

  get headers(): Headers {
    return this.#headers;
  }

  get cookies(): Record<string, string> {
    if (!this.#parsedCookies) {
      this.#parsedCookies = getCookies(this.#headers);
    }
    return this.#parsedCookies;
  }

  get body(): RapidRequestBody {
    if (!this.#bodyParsed) {
      throw new Error("Request body not parsed, you should call 'parseBody()' method before getting the body.");
    }
    return this.#body;
  }
}
