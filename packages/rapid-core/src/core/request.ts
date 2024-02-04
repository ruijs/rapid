export const GlobalRequest = global.Request;



export interface RapidRequestBody {
  type: "form-data" | "json";
  value: any;
}

export class RapidRequest {
  #raw: Request;
  #bodyParsed: boolean;
  #body: RapidRequestBody;
  method: string;
  url: URL;
  headers: Headers;
  hasBody: boolean;

  constructor(req: Request) {
    this.#raw = req;
    this.method = req.method;
    this.url = new URL(req.url);
    this.headers = req.headers;
    this.hasBody = false;
  }

  body(): RapidRequestBody {
    if (this.#bodyParsed) {
      return this.#body;
    }

    this.#bodyParsed = true;

    if (this.method === "post" || this.method === "put" || this.method === "patch") {
      this.hasBody = true;

      const contentType = this.headers.get("Content-Type");
      if (contentType.includes("json")) {
        this.#body = {
          type: "json",
          value: this.#raw.json(),
        };
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        this.#body = {
          type: "form-data",
          value: this.#raw.formData(),
        }
      }
    }

    this.#body = null;
    return this.#body;
  }
}
