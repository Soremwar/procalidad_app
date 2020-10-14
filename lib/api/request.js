import { address, port, protocol } from "../../config/app.js";
import { prefix } from "../../config/api.js";
import { messages } from "../errors/mod.js";
import { isObject } from "../utils/object.js";

const sanitizeUrl = (url) => {
  url = url[0] === "/" ? url.slice(1) : url;

  return url[url.length - 1] === "/" ? url.slice(0, url.length - 1) : url;
};

export const timedFetch = (url, options = {}, timeout = 15000) => {
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
};

/**
 * @typedef ObjectURL
 * @type object
 * @property {string} [path=] Will default to root if no parameters are provided
 * @property {Object.<string, any>} params
 * */

/**
 * @callback FetchInstance
 * @param {ObjectURL | string} [url=]
 * @param {object=} options Options for the fetch function
 * @param {number=} timeout
 * @returns {Promise<Response>}
 * */

/** @returns FetchInstance*/
export const requestGenerator = (base_url = "") => {
  base_url = sanitizeUrl(base_url);
  return function (url = "", options = {}, timeout = 15000) {
    if (isObject(url)) {
      const url_parameters = [
        prefix,
        base_url,
        url.path || "",
      ].filter((x) => x);

      const targetURI = new URL(
        `${protocol}://${address}:${port}/${url_parameters.join("/")}`,
      );
      if(isObject(url.params)){
        for (const key in url.params){
          targetURI.searchParams.append(key, url.params[key]);
        }
      }

      return timedFetch(
        targetURI,
        options,
        timeout,
      );
    } else {
      const url_parameters = [
        prefix,
        base_url,
        sanitizeUrl(String(url)),
      ].filter((x) => x);

      return timedFetch(
        `${protocol}://${address}:${port}/${url_parameters.join("/")}`,
        options,
        timeout,
      );
    }
  };
};

export const formatResponseJson = (response) => {
  return response.json()
    .then((x) => x.message || messages.UNEXPECTED_RESPONSE)
    .catch(() => messages.UNEXPECTED_RESPONSE);
};
