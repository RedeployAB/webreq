'use strict';

const { httpRequest } = require('./request-utils');

/**
 * Used to make HTTP/HTTPS requests.
 * @class
 * 
 * @returns an instance of itself.
 */
class WebReq {
  constructor() {}

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

    opts.parse = opts.parse === undefined ? true : opts.parse;
    opts.bodyOnly = opts.bodyOnly === undefined ? true : opts.bodyOnly;

    if ((opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH') && opts.body !== undefined) {
      if (opts.headers === undefined) {
        opts.headers = {};
      }
      opts.headers['Content-Length'] = Buffer.byteLength(opts.body);

      if (opts.headers['Content-Type'] === undefined) {
        opts.headers['Content-Type'] = 'application/json'
      }
    }

    if (!callback) {
      return new Promise((resolve, reject) => {
        httpRequest(uri, opts, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    } else {
      return httpRequest(uri, opts, callback);
    }
  }

  /**
   * Performs a HTTP/HTTPS GET request.
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
   * @param {function} [callback] 
   * 
   * @returns {function|Promise}
   */
  get(uri, options, callback) {
    let opts = options !== undefined ? options : { method: 'GET' };
    opts.method = 'GET';
    return this.request(uri, options, callback);
  }

  /**
   * Performs a HTTP/HTTPS POST request.
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
   * @param {function} [callback] 
   * 
   * @returns {function|Promise}
   */
  post(uri, options, callback) {
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
   * @param {string}   [options.method] HTTP method of the request. Default is GET.
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
  put(uri, options, callback) {
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
   * @param {string}   [options.method] HTTP method of the request. Default is GET.
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
  patch(uri, options, callback) {
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
   * @param {string}   [options.method] HTTP method of the request. Default is GET.
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
    let opts = options !== undefined ? options : { method: 'DELETE' };
    opts.method = 'DELETE'
    return this.request(uri, options, callback);
  }
}

module.exports = new WebReq();
