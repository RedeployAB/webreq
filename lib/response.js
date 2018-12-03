/**
 * Represents a response.
 * @class
 * @constructor
 * 
 * @property {string} statusCode  Status code of the response.
 * @property {object} headers     Headers of the response.
 * @property {any}    body        Response body.
 */
class Response {
  constructor(statusCode, headers, body) {
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body;
  }
}

module.exports = Response;