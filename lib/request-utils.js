'use strict';

const http = require('http');
const https = require('https');
const url = require('url');
const Response = require('./response');

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

/**
 * Makes requests against the specified uri with optional options.
 * 
 * @param {string}   uri
 * @param {object}   [options]
 * @param {function} [callback]
 * 
 * @returns {function}
 */
function httpRequest(uri, options, callback) {

  let parsedUrl = url.parse(uri);
  let requestOptions = createRequestOptions(parsedUrl, options)
  let proto = parsedUrl.protocol === 'http:' ? http : https;

  let req = proto.request(requestOptions, (res) => {

    let chunks = [];
    res.on('data', (d) => {
      chunks.push(d);
    });

    res.on('end', () => {
      let body;
      if (options.parse) {
        body = parseResponseBody(res.headers, chunks);
      } else {
        body = Buffer.concat(chunks).toString();
      }
      
      let response = options.bodyOnly === true ? body : new Response(res.statusCode, res.headers, body);
      callback(null, response);
    });
  });

  req.on('error', (err) => {
    callback(err);
  });

  if (options.body) {
    req.write(options.body);
  }
  req.end();
}

module.exports = {
  createRequestOptions: createRequestOptions,
  parseResponseBody: parseResponseBody,
  httpRequest: httpRequest
};
