'use strict';

const http = require('http');
const https = require('https');
const url = require('url')

const Response = require('./response');
const { createRequestOptions, parseResponseBody } = require('./utils');

/**
 * Used to make HTTP/HTTPS requests.
 * @class
 * 
 * @returns an instance of itself.
 */
class WebReq {
  constructor() {
    this.parse = true;
    this.bodyOnly = true;
    this.followRedirects = false;
    this.maxRedirects = 3;
    this.globalAgent = null;
  }

  /**
   * Performs a HTTP/HTTPS request.
   * If the optional callback is used it will return a function, if no callback is used it will
   * return a promise.
   * 
   * @param {string}   uri URI of the request.
   * @param {object}   [options] Options for the request.
   * @param {string}   [options.method] HTTP method of the request. Default is GET.
   * @param {object}   [options.headers] Additional headers of the request.
   * @param {any}      [options.body] Data to send with the request.
   * @param {boolean}  [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean}  [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean}  [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number}   [options.maxRedirects] Maximum amount of redirects.
   * @param {object}   [options.agent] Options object for agent for this request.
   * @param {boolean}  [options.agent.keepAlive] Keep sockets around even when there are
   * no outstanding requests.
   * @param {number}   [options.agent.keepAliveMsecs] When using the keepAlive option,
   * specifies the initial delay for TCP Keep-Alive packets.
   * @param {number}   [options.agent.maxSockets] Maximum number of sockets to allow per host.
   * @param {number}   [options.agent.maxFreeSockets] Maximum number of sockets to leave open in a
   * free state. Only relevant if keepAlive is set to true.
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
   * @param {string}   uri URI of the request.
   * @param {object}   [options] Options for the request.
   * @param {string}   [options.method] HTTP method of the request. Enforces GET.
   * @param {object}   [options.headers] Additional headers of the request.
   * @param {any}      [options.body] Data to send with the request.
   * @param {boolean}  [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean}  [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean}  [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number}   [options.maxRedirects] Maximum amount of redirects.
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
   * @param {string}   uri URI of the request.
   * @param {object}   [options] Options for the request.
   * @param {string}   [options.method] HTTP method of the request. Enforces POST.
   * @param {object}   [options.headers] Additional headers of the request.
   * @param {any}      [options.body] Data to send with the request.
   * @param {boolean}  [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean}  [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean}  [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number}   [options.maxRedirects] Maximum amount of redirects.
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
   * @param {string}   uri URI of the request.
   * @param {object}   [options] Options for the request.
   * @param {string}   [options.method] HTTP method of the request. Enforces PUT.
   * @param {object}   [options.headers] Additional headers of the request.
   * @param {any}      [options.body] Data to send with the request.
   * @param {boolean}  [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean}  [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean}  [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number}   [options.maxRedirects] Maximum amount of redirects.
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
   * @param {string}   uri URI of the request.
   * @param {object}   [options] Options for the request.
   * @param {string}   [options.method] HTTP method of the request. Enforces PATCH.
   * @param {object}   [options.headers] Additional headers of the request.
   * @param {any}      [options.body] Data to send with the request.
   * @param {boolean}  [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean}  [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
   * @param {boolean}  [options.followRedirects] If true it will follow redirects found in the
   * 'location' header.
   * @param {number}   [options.maxRedirects] Maximum amount of redirects.
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
   * @param {string}   uri URI of the request.
   * @param {object}   [options] Options for the request.
   * @param {string}   [options.method] HTTP method of the request. Enforces DELETE.
   * @param {object}   [options.headers] Additional headers of the request.
   * @param {any}      [options.body] Data to send with the request.
   * @param {boolean}  [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
   * @param {boolean}  [options.bodyOnly] If true it will only respond with the body, if false
   * it will return an object, Response, which contains statusCode, headers and body.
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
   * @param {number} [options.maxFreeSockets] Maximum number of sockets to leave open in a free state. 
   * Only relevant if keepAlive in request options is set to true.
   * @param
   */
  configureGlobalAgent(options) {
    let opts = options !== undefined ? options : {};

    let modified = null;

    if (opts.maxSockets !== undefined) {
      http.globalAgent.maxSockets = opts.maxSockets;
      http.globalAgent.maxFreeSockets = opts.maxFreeSockets;
      modified = 0;
    }

    if (opts.maxFreeSockets !== undefined) {
      https.globalAgent.maxSockets = opts.maxSockets;
      https.globalAgent.maxFreeSockets = opts.maxFreeSockets;
      modified = 0;
    }

    this.globalAgent = modified;
  }
}

/**
 * Makes requests against the specified uri with options.
 * 
 * @param {string}   uri URI of the request.
 * @param {object}   [options] Options for the request.
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

    if (res.statusCode >= 300 && res.statusCode < 400 &&
      options.followRedirects && options.method !== 'DELETE' &&
      options.redirects < options.maxRedirects &&
      res.headers.location !== undefined) {

        options.redirects++
        return _request(res.headers.location, options, callback);
    }

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

module.exports = new WebReq();
