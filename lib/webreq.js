'use strict';

const http = require('http');
const https = require('https');
const url = require('url');
const Readable = require('stream').Readable;

const Response = require('./response');
const { createRequestOptions, parseResponseBody, filename } = require('./utils');

/**
 * Used to make HTTP/HTTPS requests.
 * @class
 * 
 * @returns an instance of itself.
 */
class WebReq {
  constructor() {
    this.stream = false;
    this.parse = true;
    this.bodyOnly = true;
    this.followRedirects = false;
    this.maxRedirects = 3;
  }

  /**
   * Performs a HTTP/HTTPS request.
   * If the optional callback is used it will return a function, if no callback is used it will
   * return a promise.
   * 
   * @param {string} uri URI of the request.
   * @param {object} [options] Options for the request.
   * @param {string} [options.method] HTTP method of the request. Default is GET.
   * @param {object} [options.headers] Additional headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean} [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean} [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number} [options.maxRedirects] Maximum amount of redirects.
   * @param {string} [options.path] When used in a GET request for downloads, it is used as the
   * output path for a file.
   * @param {string} [options.filename] Used together with path, if a new custom filename is
   * to be used.
   * @param {object} [options.agent] Options object for agent for this request.
   * @param {boolean} [options.agent.keepAlive] Keep sockets around for future requests.
   * @param {number} [options.agent.keepAliveMsecs] Specifies initial delay for Keep-Alive
   * packets in use with the keepAlive option.
   * @param {number} [options.agent.maxSockets] Maximum number of sockets to allow per host.
   * @param {number} [options.agent.maxFreeSockets] Maximum number of sockets to leave open
   * if keepAlive is true.
   * @param {number} [options.agent.timeout] Socket timeout in milliseconds.
   * @param {function} [callback] 
   * 
   * @returns {function|Promise}
   */
  request(uri, options, callback) {

    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined
    }

    let opts = options !== undefined ? options : { method: 'GET' };

    opts.stream = opts.stream === undefined ? this.stream : opts.stream;
    opts.parse = opts.parse === undefined ? this.parse : opts.parse;
    opts.bodyOnly = opts.bodyOnly === undefined ? this.bodyOnly : opts.bodyOnly;
    opts.followRedirects = opts.followRedirects === undefined ? this.followRedirects : opts.followRedirects;
    opts.maxRedirects = opts.maxRedirects === undefined ? this.maxRedirects : opts.maxRedirects;

    opts.redirects = 0;

    if (!callback) {
      return new Promise((resolve, reject) => {
        _request(uri, opts, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    } else {
      return _request(uri, opts, callback);
    }
  }

  /**
   * Performs a HTTP/HTTPS GET request.
   * If the optional callback is used it will return a function, if no callback is used it will
   * return a promise.
   * 
   * @param {string} uri URI of the request.
   * @param {object} [options] Options for the request.
   * @param {string} [options.method] HTTP method of the request. Enforces GET.
   * @param {object} [options.headers] Additional headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {any} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean} [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean} [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number} [options.maxRedirects] Maximum amount of redirects.
   * @param {string} [options.path] When used in a GET request for downloads, it is used as the
   * output path for a file.
   * @param {string} [options.filename] Used together with path, if a new custom filename is
   * to be used.
   * @param {object} [options.agent] Options object for agent for this request.
   * @param {boolean} [options.agent.keepAlive] Keep sockets around for future requests.
   * @param {number} [options.agent.keepAliveMsecs] Specifies initial delay for Keep-Alive
   * packets in use with the keepAlive option.
   * @param {number} [options.agent.maxSockets] Maximum number of sockets to allow per host.
   * @param {number} [options.agent.maxFreeSockets] Maximum number of sockets to leave open
   * if keepAlive is true.
   * @param {number} [options.agent.timeout] Socket timeout in milliseconds.
   * @param {function} [callback] 
   * 
   * @returns {function|Promise}
   */
  get(uri, options, callback) {

    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined
    }

    return this.request(uri, options, callback);
  }

  /**
   * Performs a HTTP/HTTPS POST request.
   * If the optional callback is used it will return a function, if no callback is used it will
   * return a promise.
   * 
   * @param {string} uri URI of the request.
   * @param {object} [options] Options for the request.
   * @param {string} [options.method] HTTP method of the request. Enforces POST.
   * @param {object} [options.headers] Additional headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean} [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean} [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number} [options.maxRedirects] Maximum amount of redirects.
   * @param {object} [options.agent] Options object for agent for this request.
   * @param {boolean} [options.agent.keepAlive] Keep sockets around for future requests.
   * @param {number} [options.agent.keepAliveMsecs] Specifies initial delay for Keep-Alive
   * packets in use with the keepAlive option.
   * @param {number} [options.agent.maxSockets] Maximum number of sockets to allow per host.
   * @param {number} [options.agent.maxFreeSockets] Maximum number of sockets to leave open
   * if keepAlive is true.
   * @param {number} [options.agent.timeout] Socket timeout in milliseconds.
   * @param {function} [callback] 
   * 
   * @returns {function|Promise}
   */
  post(uri, options, callback) {

    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined
    }

    let opts = options !== undefined ? options : { method: 'POST' };
    opts.method = 'POST';
    return this.request(uri, options, callback);
  }

  /**
   * Performs a HTTP/HTTPS PUT request.
   * If the optional callback is used it will return a function, if no callback is used it will
   * return a promise.
   * 
   * @param {string} uri URI of the request.
   * @param {object} [options] Options for the request.
   * @param {string} [options.method] HTTP method of the request. Enforces PUT.
   * @param {object} [options.headers] Additional headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {any} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean} [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean} [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number} [options.maxRedirects] Maximum amount of redirects.
   * @param {object} [options.agent] Options object for agent for this request.
   * @param {boolean} [options.agent.keepAlive] Keep sockets around for future requests.
   * @param {number} [options.agent.keepAliveMsecs] Specifies initial delay for Keep-Alive
   * packets in use with the keepAlive option.
   * @param {number} [options.agent.maxSockets] Maximum number of sockets to allow per host.
   * @param {number} [options.agent.maxFreeSockets] Maximum number of sockets to leave open
   * if keepAlive is true.
   * @param {number} [options.agent.timeout] Socket timeout in milliseconds.
   * @param {function} [callback] 
   * 
   * @returns {function|Promise}
   */
  put(uri, options, callback) {

    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined
    }

    let opts = options !== undefined ? options : { method: 'PUT' };
    opts.method = 'PUT';
    return this.request(uri, options, callback);
  }

  /**
   * Performs a HTTP/HTTPS PATCH request.
   * If the optional callback is used it will return a function, if no callback is used it will
   * return a promise.
   * 
   * @param {string} uri URI of the request.
   * @param {object} [options] Options for the request.
   * @param {string} [options.method] HTTP method of the request. Enforces PATCH.
   * @param {object} [options.headers] Additional headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean} [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean} [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number} [options.maxRedirects] Maximum amount of redirects.
   * @param {object} [options.agent] Options object for agent for this request.
   * @param {boolean} [options.agent.keepAlive] Keep sockets around for future requests.
   * @param {number} [options.agent.keepAliveMsecs] Specifies initial delay for Keep-Alive
   * packets in use with the keepAlive option.
   * @param {number} [options.agent.maxSockets] Maximum number of sockets to allow per host.
   * @param {number} [options.agent.maxFreeSockets] Maximum number of sockets to leave open
   * if keepAlive is true.
   * @param {number} [options.agent.timeout] Socket timeout in milliseconds.
   * @param {function} [callback] 
   * 
   * @returns {function|Promise}
   */
  patch(uri, options, callback) {

    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined
    }

    let opts = options !== undefined ? options : { method: 'PATCH' };
    opts.method = 'PATCH';
    return this.request(uri, options, callback);
  }

  /**
   * Performs a HTTP/HTTPS DELETE request.
   * If the optional callback is used it will return a function, if no callback is used it will
   * return a promise.
   * 
   * @param {string} uri URI of the request.
   * @param {object} [options] Options for the request.
   * @param {string} [options.method] HTTP method of the request. Enforces DELETE.
   * @param {object} [options.headers] Additional headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean} [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {object} [options.agent] Options object for agent for this request.
   * @param {boolean} [options.agent.keepAlive] Keep sockets around for future requests.
   * @param {number} [options.agent.keepAliveMsecs] Specifies initial delay for Keep-Alive
   * packets in use with the keepAlive option.
   * @param {number} [options.agent.maxSockets] Maximum number of sockets to allow per host.
   * @param {number} [options.agent.maxFreeSockets] Maximum number of sockets to leave open
   * if keepAlive is true.
   * @param {number} [options.agent.timeout] Socket timeout in milliseconds.
   * @param {function} [callback] 
   * 
   * @returns {function|Promise}
   */
  delete(uri, options, callback) {

    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined
    }

    let opts = options !== undefined ? options : { method: 'DELETE' };
    opts.method = 'DELETE'
    return this.request(uri, options, callback);
  }

  /**
   * Configures the global agent for the requests.
   * If no parameter is passed, it will set default vaules of maxSockets: Infinity, maxFreeSockets: 256.
   * @param {object} [options] Options object.
   * @param {number} [options.maxSockets] Maximum number of sockets to allow per host.
   * @param {number} [options.maxFreeSockets] Maximum number of sockets to leave open if keepAlive is true.
   */
  configureGlobalAgent(options) {
    let opts = options !== undefined ? options : {};

    if (opts.maxSockets !== undefined) {
      http.globalAgent.maxSockets = opts.maxSockets;
      https.globalAgent.maxSockets = opts.maxSockets;
    }

    if (opts.maxFreeSockets !== undefined) {
      http.globalAgent.maxFreeSockets = opts.maxFreeSockets;
      https.globalAgent.maxFreeSockets = opts.maxFreeSockets;
    }
  }
}

/**
 * Makes requests against the specified uri with options.
 * 
 * @param {string} uri URI of the request.
 * @param {object} [options] Options for the request.
 * @param {function} [callback]
 * 
 * @returns {function}
 */
function _request(uri, options, callback) {

  let parsedUrl = url.parse(uri);
  let requestOptions = createRequestOptions(parsedUrl, options)
  let proto = parsedUrl.protocol === 'http:' ? http : https;

  // Add agent if such was passed.
  if (options.agent) {
    let agent = new proto.Agent(options.agent);
    requestOptions.agent = agent;
  }

  let req = proto.request(requestOptions, (res) => {
    // Check for redirect.
    if (res.statusCode >= 300 && res.statusCode < 400 &&
      options.followRedirects && options.method !== 'DELETE' &&
      options.redirects < options.maxRedirects &&
      res.headers.location !== undefined) {

      options.redirects++
      return _request(res.headers.location, options, callback);
    }
    // Determine way of handling response.
    if (options.stream) {
      _responseStreamHandler(res, callback);
    } else if (options.path) {
      _responseFileHandler(res, options, parsedUrl.path, callback);
    } else {
      _responseHandler(res, options, callback);
    }
  });

  req.on('error', (err) => {
    callback(err);
  });

  if (options.body) {
    req.write(options.body);
  }
  req.end();
}

/**
 * Handles ordinary HTTP/HTTPS responses.
 * @param {object} res Response object to handle.
 * @param {object} options Options for the request.
 * @param {function} callback Callback function.
 */
function _responseHandler(res, options, callback) {

  let data = [];
  res.on('data', (d) => {
    data.push(d);
  });

  res.on('end', () => {
    let body = options.parse ? parseResponseBody(res.headers, data) : Buffer.concat(data).toString();
    let response = options.bodyOnly === true ? body : new Response(res.statusCode, res.headers, body);
    callback(null, response);
  });
}

/**
 * Handles file download responses.
 * @param {object} res Response object to handle.
 * @param {object} options Options for the request.
 * @param {string} path Path for resulting file.
 * @param {function} callback Callback function.
 */
function _responseFileHandler(res, options, path, callback) {
  // Only load fs if file is being handled.
  let fs = require('fs');

  let fname = options.filename !== undefined ? options.filename : null;
  let outputPath = filename(res.headers, options.path, path, fname);

  let data = fs.createWriteStream(outputPath);
  res.on('data', (d) => {
    data.write(d);
  });

  res.on('end', () => {
    data.end();

    let response = options.bodyOnly === true ? null : new Response(res.statusCode, res.headers, null);
    callback(null, response);
  });
}

/**
 * Outputs response to a stream.
 * @param {object} res Response object to handle.
 * @param {function} callback Callback function.
 */
function _responseStreamHandler(res, callback) {
  callback(null, res);
}

module.exports = new WebReq();
