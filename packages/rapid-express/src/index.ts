import type * as express from "express";
import { createReadableStreamFromReadable, writeReadableStreamToWritable } from "./stream";
import { IRpdServer } from "@ruiapp/rapid-core";

export type RequestHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void>;

export function createRapidRequestHandler(server: IRpdServer) : RequestHandler {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let request = createRapidRequest(req, res);
      let response: Response = await server.handleRequest(request, next as any);;
      await sendRapidResponse(res, response);
    } catch (error: unknown) {
      // Express doesn't support async functions, so we have to pass along the
      // error manually using next().
      next(error);
    }
  };
}

export function createRapidHeaders(
  requestHeaders: express.Request["headers"]
): Headers {
  let headers = new Headers();

  for (let [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (let value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  return headers;
}

export function createRapidRequest(
  req: express.Request,
  res: express.Response
): Request {
  // req.hostname doesn't include port information so grab that from
  // `X-Forwarded-Host` or `Host`
  let [, hostnamePort] = req.get("X-Forwarded-Host")?.split(":") ?? [];
  let [, hostPort] = req.get("host")?.split(":") ?? [];
  let port = hostnamePort || hostPort;
  // Use req.hostname here as it respects the "trust proxy" setting
  let resolvedHost = `${req.hostname}${port ? `:${port}` : ""}`;
  let url = new URL(`${req.protocol}://${resolvedHost}${req.url}`);

  // Abort action/loaders once we can no longer write a response
  let controller = new AbortController();
  res.on("close", () => controller.abort());

  let init: RequestInit = {
    method: req.method,
    headers: createRapidHeaders(req.headers),
    signal: controller.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = createReadableStreamFromReadable(req);
    (init as { duplex: "half" }).duplex = "half";
  }

  return new Request(url.href, init);
}

export async function sendRapidResponse(
  res: express.Response,
  rapidResponse: Response
): Promise<void> {
  res.statusMessage = rapidResponse.statusText;
  res.status(rapidResponse.status);

  for (let [key, value] of rapidResponse.headers.entries()) {
    res.append(key, value);
  }

  if (rapidResponse.headers.get("Content-Type")?.match(/text\/event-stream/i)) {
    res.flushHeaders();
  }

  if (rapidResponse.body) {
    await writeReadableStreamToWritable(rapidResponse.body, res);
  } else {
    res.end();
  }
}
