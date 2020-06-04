import { address, port, protocol } from "../../config/app.js";
import { prefix } from "../../config/api.js";
import { messages } from "../errors/mod.js";

const sanitizeUrl = (url) => {
  url = url[0] === "/" ? url.slice(1) : url;

  return url[url.length - 1] === "/" ? url.slice(0, url.length - 1) : url;
};

export const timedFetch = (url, options = {}, timeout = 15000) => {
  if (options.signal) throw new Error('Propiedad "signal" personalizada no permitida en esta instancia de fetch');
  const controller = new AbortController();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error("El servidor ha tardado mucho tiempo en responder\nVerifique su conexion"));
    }, timeout);
    fetch(url, { signal: controller.signal, ...options })
      .then(resolve, reject)
      .finally(() => clearTimeout(timer));
  });
}

export const requestGenerator = (base_url = "") => {
  base_url = sanitizeUrl(base_url);
  return function (url = "", options = {}, timeout = 15000) {
    url = sanitizeUrl(url);
    const url_parameters = [
      prefix,
      base_url,
      url,
    ].filter(x => x);
    return timedFetch(`${protocol}://${address}:${port}/${url_parameters.join('/')}`, options, timeout);
  };
};

export const formatResponseJson = (response) => {
  return response.json()
    .then(x => x.message || messages.UNEXPECTED_RESPONSE)
    .catch(() => messages.UNEXPECTED_RESPONSE);
};