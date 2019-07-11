'use strict';

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

const Response = require('./response');
const { createRequestOptions, filename, isStream, parseResponseBody } = require('./utils');

/**
 * Used to make HTTP/HTTPS requests.
 * @class
 * @return an instance of itself.
 */
class WebReq {
  constructor() {
    this.stream = false;
    this.parse = true;
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
   * @param {object} [options.headers] Headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
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
   * @param {object} [options.certificate] Certificate options for the request (HTTPS).
   * @param {string|Buffer} [options.certificate.ca] Override the trusted CA certificates.
   * @param {string|Buffer} [options.certificate.cert] Certificate chains in PEM format.
   * @param {string|Buffer} [options.certificate.key] Private keys in PEM format. If encrypted
   * use together with options.certificate.passphrase.
   * @param {string} [options.certificate.passphrase] Shared passphrase for a private key and/or PFX.
   * @param {string|Buffer|Array} [options.certificate.pfx] PFX pr PKCS12 encoded private key and
   * certificate chain.
   * @param {function} [callback] Optional callback funtion.
   * @return {function|Promise} Returns a Promise which resolves to a Response object if no callback is provided.
   */
  request(uri, options, callback) {

    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined
    }

    let opts = options !== undefined ? options : { method: 'GET' };
    // Handle options and set default values.
    opts.stream = opts.stream === undefined ? this.stream : opts.stream;
    opts.parse = opts.parse === undefined ? this.parse : opts.parse;
    opts.followRedirects = opts.followRedirects === undefined ? this.followRedirects : opts.followRedirects;
    opts.maxRedirects = opts.maxRedirects === undefined ? this.maxRedirects : opts.maxRedirects;
    opts.redirects = 0;

    // Handle body options. Stringify if options is JSON object and not a stream.
    if (opts.body && !isStream(opts.body) && !Buffer.isBuffer(opts.body) && typeof opts.body !== 'string') {
      opts.body = JSON.stringify(opts.body);
    } else if ((opts.method === 'POST'|| opts.method === 'PUT') && opts.path) {
      opts.body = fs.createReadStream(opts.path);
    }

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
   * @param {object} [options.headers] Headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
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
   * @param {object} [options.certificate] Certificate options for the request (HTTPS).
   * @param {string|Buffer} [options.certificate.ca] Override the trusted CA certificates.
   * @param {string|Buffer} [options.certificate.cert] Certificate chains in PEM format.
   * @param {string|Buffer} [options.certificate.key] Private keys in PEM format. If encrypted
   * use together with options.certificate.passphrase.
   * @param {string} [options.certificate.passphrase] Shared passphrase for a private key and/or PFX.
   * @param {string|Buffer|Array} [options.certificate.pfx] PFX pr PKCS12 encoded private key and
   * certificate chain.
   * @param {function} [callback] Optional callback funtion.
   * @return {function|Promise} Returns a Promise which resolves to a Response object if no callback is provided.
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
   * @param {object} [options.headers] Headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
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
   * @param {object} [options.certificate] Certificate options for the request (HTTPS).
   * @param {string|Buffer} [options.certificate.ca] Override the trusted CA certificates.
   * @param {string|Buffer} [options.certificate.cert] Certificate chains in PEM format.
   * @param {string|Buffer} [options.certificate.key] Private keys in PEM format. If encrypted
   * use together with options.certificate.passphrase.
   * @param {string} [options.certificate.passphrase] Shared passphrase for a private key and/or PFX.
   * @param {string|Buffer|Array} [options.certificate.pfx] PFX pr PKCS12 encoded private key and
   * certificate chain.
   * @param {function} [callback] Optional callback funtion.
   * @return {function|Promise} Returns a Promise which resolves to a Response object if no callback is provided.
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
   * @param {object} [options.headers] Headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
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
   * @param {object} [options.certificate] Certificate options for the request (HTTPS).
   * @param {string|Buffer} [options.certificate.ca] Override the trusted CA certificates.
   * @param {string|Buffer} [options.certificate.cert] Certificate chains in PEM format.
   * @param {string|Buffer} [options.certificate.key] Private keys in PEM format. If encrypted
   * use together with options.certificate.passphrase.
   * @param {string} [options.certificate.passphrase] Shared passphrase for a private key and/or PFX.
   * @param {string|Buffer|Array} [options.certificate.pfx] PFX pr PKCS12 encoded private key and
   * certificate chain.
   * @param {function} [callback] Optional callback funtion.
   * @return {function|Promise} Returns a Promise which resolves to a Response object if no callback is provided.
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
   * @param {object} [options.headers] Headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
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
   * @param {object} [options.certificate] Certificate options for the request (HTTPS).
   * @param {string|Buffer} [options.certificate.ca] Override the trusted CA certificates.
   * @param {string|Buffer} [options.certificate.cert] Certificate chains in PEM format.
   * @param {string|Buffer} [options.certificate.key] Private keys in PEM format. If encrypted
   * use together with options.certificate.passphrase.
   * @param {string} [options.certificate.passphrase] Shared passphrase for a private key and/or PFX.
   * @param {string|Buffer|Array} [options.certificate.pfx] PFX pr PKCS12 encoded private key and
   * certificate chain.
   * @param {function} [callback] Optional callback funtion.
   * @return {function|Promise} Returns a Promise which resolves to a Response object if no callback is provided.
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
   * @param {object} [options.headers] Headers of the request.
   * @param {boolean} [options.stream] Returns response as a stream.
   * @param {string|object} [options.body] Data to send with the request.
   * @param {boolean} [options.parse] If true it will check the mime type of the response
   * and output the results accordingly. Default is true.
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
   * @param {object} [options.certificate] Certificate options for the request (HTTPS).
   * @param {string|Buffer} [options.certificate.ca] Override the trusted CA certificates.
   * @param {string|Buffer} [options.certificate.cert] Certificate chains in PEM format.
   * @param {string|Buffer} [options.certificate.key] Private keys in PEM format. If encrypted
   * use together with options.certificate.passphrase.
   * @param {string} [options.certificate.passphrase] Shared passphrase for a private key and/or PFX.
   * @param {string|Buffer|Array} [options.certificate.pfx] PFX pr PKCS12 encoded private key and
   * certificate chain.
   * @param {function} [callback] Optional callback funtion.
   * @return {function|Promise} Returns a Promise which resolves to a Response object if no callback is provided.
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
  globalAgent(options) {
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
 * @return {function}
 */
function _request(uri, options, callback) {

  let parsedUrl = url.parse(uri);
  let requestOptions = createRequestOptions(parsedUrl, options)
  let proto = parsedUrl.protocol === 'http:' ? http : https;
  // Add agent if such was passed.
  if (options.agent !== undefined) {
    requestOptions.agent = options.agent !== false ? new proto.Agent(requestOptions) : false;
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
      callback(null, res);
    } else if (options.path && requestOptions.method === 'GET') {
      _responseFileHandler(res, options, parsedUrl.path, callback);
    } else {
      _responseHandler(res, options, callback);
    }
  });

  req.on('error', (err) => {
    callback(err);
  });

  // Handle request body.
  if (options.body) {
    _requestWriter(req, options.body);
  } else {
    req.end();
  }
}

/**
 * Handles ordinary HTTP/HTTPS responses.
 * @param {object} res Response object to handle.
 * @param {object} options Options for the request.
 * @param {function} callback Callback function.
 */
function _responseHandler(res, options, callback) {

  let data = [];
  res.on('data', d => {
    data.push(d);
  });

  res.on('end', () => {
    let body = options.parse ? parseResponseBody(res.headers, data) : Buffer.concat(data).toString();
    callback(null, new Response(res.statusCode, res.headers, body));
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
  res.on('data', d => {
    data.write(d);
  });

  res.on('end', () => {
    data.end();
    callback(null, new Response(res.statusCode, res.headers, null));
  });
}

function _requestWriter(req, data) {
  if (isStream(data)) {
    data.on('data', d => {
      req.write(d);
    }).on('end', () => {
      req.end();
    });
  } else {
    req.write(data);
  }
}

module.exports = new WebReq();
