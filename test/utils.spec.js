const { expect } = require('chai');
const url = require('url');
const fs = require('fs');

const { createRequestOptions, parseResponseBody, isStream } = require('../lib/utils');

describe('request-utils', () => {

  describe('createRequestOptions()', () => {

    it('should parse hostname, port, path and headers (HTTPS default to 443, default to GET)', () => {

      let parsedUrl = url.parse('https://codecloudandrants.io');
      let requestOptions = createRequestOptions(parsedUrl);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(443);
      expect(requestOptions.path).to.equal('/');
      expect(requestOptions.method).to.equal('GET');
      expect(requestOptions.headers).to.be.undefined;
    });

    it('should parse should parse hostname, port, path, method and headers (with port in url)', () => {

      let options = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
      let parsedUrl = url.parse('https://codecloudandrants.io:8443/a-path?istrue=true');
      let requestOptions = createRequestOptions(parsedUrl, options);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(8443);
      expect(requestOptions.path).to.equal('/a-path?istrue=true');
      expect(requestOptions.method).to.equal('POST');
      expect(requestOptions.headers).to.be.an('Object');
    });

    it('should set Content-Length header if a body is in the options without Content-Length', () => {

      let options = { method: 'POST', body: '{"data":"somedata"}' };
      let parsedUrl = url.parse('https://codecloudandrants.io:8443/a-path?istrue=true');
      let requestOptions = createRequestOptions(parsedUrl, options);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(8443);
      expect(requestOptions.path).to.equal('/a-path?istrue=true');
      expect(requestOptions.method).to.equal('POST');
      expect(requestOptions.headers).to.be.an('Object');
    });

    it('should set Content-Length header if a body is in the options with Content-Length', () => {

      let options = { method: 'POST', body: '{"data":"somedata"}', headers: {'Content-Length': 19 } };
      let parsedUrl = url.parse('https://codecloudandrants.io:8443/a-path?istrue=true');
      let requestOptions = createRequestOptions(parsedUrl, options);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(8443);
      expect(requestOptions.path).to.equal('/a-path?istrue=true');
      expect(requestOptions.method).to.equal('POST');
      expect(requestOptions.headers).to.be.an('Object');
    });

    it('should parse hostname, port, path and headers (HTTP default to 80)', () => {

      let parsedUrl = url.parse('http://codecloudandrants.io');
      let requestOptions = createRequestOptions(parsedUrl);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(80);
      expect(requestOptions.path).to.equal('/');
      expect(requestOptions.method).to.equal('GET');
      expect(requestOptions.headers).to.be.undefined;
    });

    it('should parse hostname, port, path and headers (with port in URL)', () => {

      let parsedUrl = url.parse('http://codecloudandrants.io:8080');
      let requestOptions = createRequestOptions(parsedUrl);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(8080);
      expect(requestOptions.path).to.equal('/');
      expect(requestOptions.method).to.equal('GET');
      expect(requestOptions.headers).to.be.undefined;
    });

    it('should add additional ssl/cert options if protocol is https and they are provided in options.certificate', () => {

      let options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, certificate: { ca: 'pathToCert' }};
      let parsedUrl = url.parse('https://codecloudandrants.io');

      let requestOptions = createRequestOptions(parsedUrl, options);

      expect(requestOptions.hostname).to.equal('codecloudandrants.io');
      expect(requestOptions.port).to.equal(443);
      expect(requestOptions.path).to.equal('/');
      expect(requestOptions.method).to.equal('POST');
      expect(requestOptions.headers).to.be.an('Object');
      expect(requestOptions.ca).to.equal('pathToCert');
    });
  });

  describe('parseResponseBody()', () => {

    it('should try to parse the response as JSON (return JSON object) if no Content-Type is present', () => {
      let headers = {};
      let str = '{"data":"some data"}';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.an('Object');
      expect(parsedBody.data).equal('some data');
    });

    it('should try to parse the response as JSON (return string) if no Content-Type is present', () => {
      let headers = {};
      let str = 'some data';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.a('string');
      expect(parsedBody).to.equal('some data')
    });

    it('should try to parse the response as JSON (return JSON object) if Content-Type (application/json) is present', () => {
      let headers = { 'content-type': 'application/json' };
      let str = '{"data":"some data"}';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.an('Object');
      expect(parsedBody.data).equal('some data');
    });

    it('should try to parse the response as plain text (return string) if Content-Type (text/html) is present', () => {
      let headers = { 'content-type': 'text/html' };
      let str = 'some data';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.a('string');
      expect(parsedBody).to.equal('some data')
    });

    it('should try to parse the response as plain text (return string) if Content-Type (other) is present', () => {
      let headers = { 'content-type': 'text/plain' };
      let str = 'some data';
      let buf = Buffer.from(str, 'utf8');
      let parsedBody = parseResponseBody(headers, [buf]);

      expect(parsedBody).to.be.a('string');
      expect(parsedBody).to.equal('some data')
    });
  });

  describe('isStream()', () => {

    it('should return true if passed in object is a stream', () => {
      let rs = fs.createReadStream(__dirname + '/mockfile/read.txt');
      expect(isStream(rs)).to.be.true;
    });

    it('shoul return false if passed in object is not a stream', () => {
      let obj1 = {}, obj2 = 'string';

      expect(isStream(obj1)).to.be.false;
      expect(isStream(obj2)).to.be.false;
    });
  });
});
