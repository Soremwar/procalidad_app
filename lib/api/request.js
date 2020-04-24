import { address, port, protocol } from "../../config/app.js";
import { prefix } from "../../config/api.js";

export const sanitizeUrl = (url) => {
  url = url[0] === "/" ? url.slice(1) : url;

  return url[url.length - 1] === "/" ? url.slice(0, url.length - 1) : url;
};

export const requestGenerator = (base_url = "") => {
  base_url = sanitizeUrl(base_url);
  return function (url = "", options = {}) {
    url = sanitizeUrl(url);
    const parameters = [
      prefix,
      base_url,
      url,
    ].filter(x => x);
    return fetch(`${protocol}://${address}:${port}/${parameters.join('/')}`, options);
  };
};
