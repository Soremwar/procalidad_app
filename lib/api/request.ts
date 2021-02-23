import { address, api, port, protocol } from "../../config/app";
import { messages } from "../errors/mod.js";
import { isObject } from "../utils/object.js";

export interface Response<T = any> {
  json(): Promise<T>;
}

const sanitizeUrl = (url) => {
  url = url[0] === "/" ? url.slice(1) : url;

  return url[url.length - 1] === "/" ? url.slice(0, url.length - 1) : url;
};

export function timedFetch<T>(
  url,
  options: RequestInit = {},
  timeout = 15000,
): Promise<Response<T>> {
  if (options.signal) {
    throw new Error(
      'Propiedad "signal" personalizada no permitida en esta instancia de fetch',
    );
  }
  const controller = new AbortController();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(
        new Error(
          "El servidor ha tardado mucho tiempo en responder\nVerifique su conexion",
        ),
      );
    }, timeout);

    fetch(url, { signal: controller.signal, ...options })
      .then(resolve, reject)
      .finally(() => clearTimeout(timer));
  });
}

interface ObjectURL {
  /** Will default to root if no parameters are provided */
  path?: string;
  /** The url request parameters passed on the request */
  params: { [key: string]: any };
}

export function requestGenerator(
  base_url = "",
) {
  base_url = sanitizeUrl(base_url);
  return function <T>(
    url: string | number | ObjectURL = "",
    options: RequestInit = {},
    timeout = 15000,
  ) {
    if (typeof url === "string" || typeof url === "number") {
      const url_parameters = [
        api.prefix,
        base_url,
        sanitizeUrl(String(url)),
      ].filter((x) => x);

      return timedFetch<T>(
        `${protocol}://${address}:${port}/${url_parameters.join("/")}`,
        options,
        timeout,
      );
    } else {
      const url_parameters = [
        api.prefix,
        base_url,
        url.path || "",
      ].filter((x) => x);

      const targetURI = new URL(
        `${protocol}://${address}:${port}/${url_parameters.join("/")}`,
      );
      if (isObject(url.params)) {
        for (const key in url.params) {
          // Filter undefined values
          url.params[key] &&
            targetURI.searchParams.append(key, url.params[key]);
        }
      }

      return timedFetch<T>(
        targetURI,
        options,
        timeout,
      );
    }
  };
}

export const formatResponseJson = (response) => {
  return response.json()
    .then((x) => x.message || messages.UNEXPECTED_RESPONSE)
    .catch(() => messages.UNEXPECTED_RESPONSE);
};
