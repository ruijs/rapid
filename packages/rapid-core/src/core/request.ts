import qs from "qs";

export const GlobalRequest = global.Request;

export interface RapidRequestBody {
  type: "form-data" | "json" | "form";
  value: any;
}

export class RapidRequest {
  #raw: Request;
  #bodyParsed: boolean;
  #body: RapidRequestBody;
  method: string;
  url: URL;
  headers: Headers;

  constructor(req: Request) {
    this.#raw = req;
    this.method = req.method;
    this.url = new URL(req.url);
    this.headers = req.headers;
  }

  async parseBody(): Promise<void> {
    if (this.#bodyParsed) {
      console.warn("Request body has been parsed. 'parseBody()' method should not be called more than once.");
      return;
    }

    const requestMethod = this.method;
    if (requestMethod === "POST" || requestMethod === "PUT" || requestMethod === "PATCH") {
      const req = this.#raw;
      const contentType = this.headers.get("Content-Type");
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
        }
      } else if (contentType.startsWith("multipart/form-data")) {
        this.#body = {
          type: "form-data",
          value: await req.formData(),
        }
      }
    } else {
      this.#body = null;
    }
    this.#bodyParsed = true;
  }

  get rawRequest(): Request {
    return this.#raw;
  }

  get body(): RapidRequestBody {
    if (!this.#bodyParsed) {
      throw new Error("Request body not parsed, you should call 'parseBody()' method before getting the body.")
    }
    return this.#body;
  }
}
