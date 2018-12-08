'use strict';

const Stream = require('stream');

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

  let method = opts.method !== undefined ? opts.method : 'GET';
  let headers = opts.headers !== undefined ? opts.headers : {};

  if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && opts.body !== undefined) {
    if (headers['Content-Type'] === undefined && headers["content-type"] === undefined) {
      headers['Content-Type'] = 'application/json'
    }

    if (!isStream(opts.body) && typeof opts.body !== 'string') {
      opts.body = JSON.stringify(opts.body);
    }

    headers['Content-Length'] = Buffer.byteLength(opts.body);
  }

  let requestOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port !== null ? parseInt(parsedUrl.port) : (parsedUrl.protocol === 'https:') ? 443 : 80,
    path: parsedUrl.search === null ? parsedUrl.pathname : parsedUrl.pathname + parsedUrl.search,
    method: method
  };

  if (Object.keys(headers).length !== 0) {
    requestOptions.headers = headers;
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

function isStream(obj) {
  return obj instanceof Stream;
}

module.exports = {
  createRequestOptions: createRequestOptions,
  parseResponseBody: parseResponseBody,
  isStream: isStream
};
