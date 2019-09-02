'use strict';

const Stream = require('stream');
const path = require('path');
const url = require('url');

/**
 * Create options for a HTTP/HTTPS request.
 * 
 * @param {string} parsedUrl Persed URI/URL (using built-in 'url' module) of the request.
 * @param {object} [options] Options of the request.
 * @return {object} Returns object containing request options.
 */
function createRequestOptions(parsedUrl, options) {
  let opts = options !== undefined ? options : {};

  let method = opts.method !== undefined ? opts.method : 'GET';
  let headers = opts.headers !== undefined ? opts.headers : {};

  // Handle POST/PUT/PATCH and Content-Type and Content-Length.
  if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && opts.body !== undefined) {
    if (headers['Content-Type'] === undefined && headers['content-type'] === undefined) {
      headers['Content-Type'] = 'application/json'
    }

    if (headers['Content-Length'] === undefined && headers['content-length'] === undefined && typeof opts.body === 'string') {
      headers['Content-Length'] = Buffer.byteLength(opts.body);
    }
  }

  let host = parsedUrl.hostname;
  let port = parsedUrl.port !== null ? parseInt(parsedUrl.port) : (parsedUrl.protocol === 'https:') ? 443 : 80;
  let path = parsedUrl.search === null ? parsedUrl.pathname : parsedUrl.pathname + parsedUrl.search;

  // Check for proxy and modify the arguments accordingly.
  if (opts.proxy) {
    let parsedProxyUrl = url.parse(opts.proxy);
    host = parsedProxyUrl.hostname;
    port = parsedProxyUrl.port;
    path = parsedUrl.href;
    headers['Host'] = parsedUrl.protocol + '//' + parsedUrl.host;
  }

  let requestOptions = {
    host: host,
    port: port,
    path: path,
    method: method
  };

  if (Object.keys(headers).length !== 0) {
    requestOptions.headers = headers;
  }

  // Check if protocol is HTTPS and if cert options is specified
  // and see if additional options for sending SSL ceritificates
  // is present.
  if (parsedUrl.protocol === 'https:' && opts.certificate) {
    for (let key in opts.certificate) {
      requestOptions[key] = opts.certificate[key];
    }
  }

  return requestOptions;
}

/**
 * Parses a response body based on passed in headers.
 * If the mime type is 'application/json' it will parse
 * it to an object. If no 'Content-Type' is found it will try
 * to determine the body.
 * 
 * @param {object} headers Headers of the response.
 * @param {Array} body Array of Buffer(s).
 * @return {object|string} Returns string or object depending on mime type of the response.
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
 * Determines a file name based on incoming parameters.
 * @param {object} headers Used to verify if Content-Disposition is set.
 * @param {string} outputPath Output path for the file.
 * @param {string} uriPath Parsed path of the requested URL.
 * @param {string} name If specified it will set this name of the file.
 * @return {string} Returns filename.
 */
function filename(headers, outputPath, uriPath, name) {
  if (name !== undefined && name !== null) {
    filename = name;
  } else if (headers['content-disposition'] !== undefined && headers['content-disposition'].includes('filename')) {
    filename = headers['content-disposition'].split('=')[1];
  } else {
    filename = path.basename(uriPath);
  }

  return path.join(outputPath, filename);
}

/**
 * Checks if object is a Stream.
 * @param {object} obj Object to check.
 * @return {boolean} Returns true if it's a Stream.
 */
function isStream(obj) {
  return obj instanceof Stream;
}

module.exports = {
  createRequestOptions: createRequestOptions,
  parseResponseBody: parseResponseBody,
  isStream: isStream,
  filename: filename
};
