const { expect } = require('chai');
const url = require('url');
const { Passthrough } = require('stream');
const http = require('http');
const https = require('https');

const { createRequestOptions, parseResponseBody } = require('../lib/request-utils');

describe('request-utils', () => {

  describe('createRequestOptions()', () => {

    it('should parse hostname, port, path and headers (HTTPS default to 443, default to GET)', (done) => {
    
      let parsedUrl = url.parse('https://codecloudandrants.io');
      let requestOptions = createRequestOptions(parsedUrl);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(443);
      expect(requestOptions.path).to.equal('/');
      expect(requestOptions.method).to.equal('GET');
      expect(requestOptions.headers).to.be.undefined;

      done();
    });

    it('should parse should parse hostname, port, path, method and headers (with port in url)', (done) => {

      let options = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
      let parsedUrl = url.parse('https://codecloudandrants.io:8443/a-path?istrue=true');
      let requestOptions = createRequestOptions(parsedUrl, options);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(8443);
      expect(requestOptions.path).to.equal('/a-path?istrue=true');
      expect(requestOptions.method).to.equal('POST');
      expect(requestOptions.headers).to.be.an('Object');

      done();
    });

    it('should parse hostname, port, path and headers (HTTP default to 80)', (done) => {

      let parsedUrl = url.parse('http://codecloudandrants.io');
      let requestOptions = createRequestOptions(parsedUrl);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(80);
      expect(requestOptions.path).to.equal('/');
      expect(requestOptions.method).to.equal('GET');
      expect(requestOptions.headers).to.be.undefined;

      done();
    });

    it('should parse hostname, port, path and headers (with port in URL)', (done) => {

      let parsedUrl = url.parse('http://codecloudandrants.io:8080');
      let requestOptions = createRequestOptions(parsedUrl);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(8080);
      expect(requestOptions.path).to.equal('/');
      expect(requestOptions.method).to.equal('GET');
      expect(requestOptions.headers).to.be.undefined;

      done();
    });
  });

  describe('parseResponseBody()', () => {

    it('should try to parse the response as JSON (return JSON object) if no Content-Type is present', (done) => {
      let headers = {};
      let str = '{"data":"some data"}';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.an('Object');
      expect(parsedBody.data).equal('some data');

      done();
    });

    it('should try to parse the response as JSON (return string) if no Content-Type is present', (done) => {
      let headers = {};
      let str = 'some data';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.a('string');
      expect(parsedBody).to.equal('some data')

      done();
    });

    it('should try to parse the response as JSON (return JSON object) if Content-Type (application/json) is present', (done) => {
      let headers = {'content-type': 'application/json'};
      let str = '{"data":"some data"}';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.an('Object');
      expect(parsedBody.data).equal('some data');

      done();
    });

    it('should try to parse the response as plain text (return string) if Content-Type (text/html) is present', (done) => {
      let headers = {'content-type': 'text/html'};
      let str = 'some data';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.a('string');
      expect(parsedBody).to.equal('some data')

      done();
    });

    it('should try to parse the response as plain text (return string) if Content-Type (other) is present', (done) => {
      let headers = {'content-type': 'text/plain'};
      let str = 'some data';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.a('string');
      expect(parsedBody).to.equal('some data')

      done();
    });
  });
});
