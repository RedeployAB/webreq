'use strict';

/**
 * Create options for a HTTP/HTTPS request.
 * 
 * @param {string}  parsedUrl Persed URI/URL (using built-in 'url' module) of the request.
 * @param {object}  [options] Options of the request.
 * @param {string}  [options.method] Method of the request.
 * @param {object}  [optons.headers] Headers of the request.
 * 
 * @returns {object}
 */
function createRequestOptions(parsedUrl, options) {
  let opts = (options !== undefined) ? options : {};

  let requestOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port !== null ? parseInt(parsedUrl.port) : (parsedUrl.protocol === 'https:') ? 443 : 80,
    path: parsedUrl.search === null ? parsedUrl.pathname : parsedUrl.pathname + parsedUrl.search,
    method: opts.method !== undefined ? opts.method : 'GET'
  };

  if (opts.headers !== undefined) {
    requestOptions.headers = opts.headers;
  }

  return requestOptions;
}

/**
 * Parses a response body based on passed in headers.
 * If the mime type is 'application/json' it will parse
 * it to an object. If no 'Content-Type' is found it will try
 * to determine the body.
 * 
 * @param {object}  headers headers of the response. 
 * @param {array}   body    array of Buffer(s).
 * 
 * @returns {any}    returns depends on mime type of the response.
 */
function parseResponseBody(headers, body) {
  let mimeType, parsedBody;
  if (headers['content-type'] !== undefined) {
    mimeType = headers['content-type'].replace(/\s+/, '').split(';')[0]
    // TODO: Add more MIME types.
    switch (mimeType) {
      case 'application/json':
        try {
          parsedBody = JSON.parse(Buffer.concat(body).toString());
        } catch (error) {
          parsedBody = 'Malformed JSON.'
        }
        break;
      default:
        parsedBody = Buffer.concat(body).toString();
        break;
    }
  } else {
    try {
      parsedBody = JSON.parse(Buffer.concat(body).toString());
    } catch (error) {
      parsedBody = Buffer.concat(body).toString();
    }
  }

  return parsedBody;
}

module.exports = {
  createRequestOptions: createRequestOptions,
  parseResponseBody: parseResponseBody
};
