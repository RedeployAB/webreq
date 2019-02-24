const { expect } = require('chai');
const sinon = require('sinon');
const { PassThrough } = require('stream');
const https = require('https');
const http = require('http');
const assert = require('assert');

const webreq = require('../lib/webreq');

describe('webreq', () => {

  describe('request()', () => {

    beforeEach(() => {
      this.request = sinon.stub(https, 'request');
    });

    afterEach(() => {
      https.request.restore();
    });

    it('should handle a GET request and parse the results (promise)', () => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      return webreq.request('https://someurl.not').then(res => {
        expect(res).to.eql({ data: "data" });
      });
    });

    it('should handle a GET request, follow redirect, and parse the results (promise)', () => {
      // Define first call.
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json', 'location': 'https://someurl.not/redirect' }
      response.statusCode = 302;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      return webreq.request('https://someurl.not', { followRedirects: true, maxRedirects: 3 }).then(res => {
        expect(res).to.eql({ data: "data" });
      });
    });

    it('should handle a GET request, follow redirect (and handle no location header), and parse the results (promise)', () => {
      // Define first call.
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 302;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      return webreq.request('https://someurl.not', { followRedirects: true, maxRedirects: 3 }).then(res => {
        expect(res).to.eql({ data: "data" });
      });
    });

    it('should handle a GET request with modified agent settings (promise)', () => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      let options = {
        agent: {
          keepAlive: true,
          keepAliveMsecs: 500,
          maxSockets: 256,
          maxFreeSockets: 256
        }
      };

      return webreq.request('https://someurl.not', options).then(res => {
        expect(res).to.eql({ data: "data" });
      });
    });

    it('should handle a GET request and parse the results (callback)', (done) => {
      let mockRes = { data: "data" };
      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.request('https://someurl.not', (err, res) => {
        expect(res).to.eql({ data: "data" });
        done();
      });
    });

    it('should handle a GET request and parse the results (callback) with options', (done) => {
      let mockRes = { data: "data" };
      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.request('https://someurl.not', { method: 'GET' }, (err, res) => {
        expect(res).to.eql({ data: "data" });
        done();
      });
    });

    it('should handle a GET request and parse the results (callback) malformed JSON', (done) => {
      let mockRes = '[{"some":"data"';
      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(mockRes);
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.request('https://someurl.not', { method: 'GET' }, (err, res) => {
        expect(res).to.equal('Malformed JSON.');
        done();
      });
    });

    it('should handle a GET request and parse the results (callback) with options, no parse', (done) => {
      let mockRes = { data: "data" };
      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.request('https://someurl.not', { method: 'GET', parse: false }, (err, res) => {
        expect(res).to.eql('{"data":"data"}');
        done();
      });
    });

    it('should handle a GET request and parse the results (callback) with options, full response', (done) => {
      let mockRes = { data: "data" };
      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.request('https://someurl.not', { method: 'GET', bodyOnly: false }, (err, res) => {
        expect(res).to.eql({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: mockRes });
        done();
      });
    });

  });

  describe('get()', () => {

    beforeEach(() => {
      this.request = sinon.stub(https, 'request');
    });

    afterEach(() => {
      https.request.restore();
    });

    it('should handle a GET request and parse the results (promise)', () => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      return webreq.get('https://someurl.not').then(res => {
        expect(res).to.eql({ data: "data" });
      });
    });

    it('should handle a GET request and parse the results (callback)', (done) => {
      let mockRes = { data: "data" };
      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.get('https://someurl.not', (err, res) => {
        expect(res).to.eql({ data: "data" });
        done();
      });
    });

  });

  describe('post()', () => {

    beforeEach(() => {
      this.request = sinon.stub(https, 'request');
    });

    afterEach(() => {
      https.request.restore();
    });

    it('should handle a POST request and parse the results (promise)', (done) => {
      let params = { foo: 'bar' };
      let paramsString = JSON.stringify(params);

      let request = new PassThrough();
      let write = sinon.spy(request, 'write');

      this.request.returns(request);

      webreq.post('https://someurl.not', { method: 'POST', body: paramsString }).then(() => { });

      assert(write.withArgs(paramsString).calledOnce);
      done();
    });

    it('should handle a POST request and parse the results (promise), handle non-string payload', (done) => {
      let params = { foo: 'bar' };

      let request = new PassThrough();
      let write = sinon.spy(request, 'write');

      this.request.returns(request);

      webreq.post('https://someurl.not', { method: 'POST', body: params }).then(() => { });

      assert(write.withArgs(JSON.stringify(params)).calledOnce);
      done();
    });

    it('should handle a POST request and parse the results (callback)', (done) => {
      let params = { foo: 'bar' };
      let paramsString = JSON.stringify(params);

      let request = new PassThrough();
      let write = sinon.spy(request, 'write');

      this.request.returns(request);

      webreq.post('https://someurl.not', { method: 'POST', body: paramsString }, () => { });
      assert(write.withArgs(paramsString).calledOnce);
      done();
    });

    it('should handle a POST request and parse the results (callback) with Content-Type', (done) => {
      let params = { foo: 'bar' };
      let paramsString = JSON.stringify(params);

      let request = new PassThrough();
      let write = sinon.spy(request, 'write');

      this.request.returns(request);

      webreq.post('https://someurl.not', { method: 'POST', body: paramsString, headers: { 'Content-Type': 'application/json' } }, () => { });
      assert(write.withArgs(paramsString).calledOnce);
      done();
    });

    it('should handle a POST request and parse the results (promise), enforce method', (done) => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.post('https://someurl.not/id/1').then(res => {
        expect(res).to.eql({ data: "data" });
        done();
      });
    });

    it('should handle a POST request and parse the results (callback), enforce method', (done) => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.post('https://someurl.not', (err, res) => {
        expect(res).to.eql({ data: "data" });
        done();
      });
    });

  });

  describe('put()', () => {

    beforeEach(() => {
      this.request = sinon.stub(https, 'request');
    });

    afterEach(() => {
      https.request.restore();
    });

    it('should handle a PUT request and parse the results (promise)', (done) => {
      let params = { foo: 'bar' };
      let paramsString = JSON.stringify(params);

      let request = new PassThrough();
      let write = sinon.spy(request, 'write');

      this.request.returns(request);

      webreq.put('https://someurl.not/id/1', { method: 'PUT', body: paramsString }).then(() => { });

      assert(write.withArgs(paramsString).calledOnce);
      done();
    });

    it('should handle a PUT request and parse the results (callback)', (done) => {
      let params = { foo: 'bar' };
      let paramsString = JSON.stringify(params);

      let request = new PassThrough();
      let write = sinon.spy(request, 'write');

      this.request.returns(request);

      webreq.put('https://someurl.not/id/1', { method: 'PUT', body: paramsString }, () => { });
      assert(write.withArgs(paramsString).calledOnce);
      done();
    });

    it('should handle a PUT request and parse the results (promise), enforce method', (done) => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.put('https://someurl.not/id/1').then(res => {
        expect(res).to.eql({ data: "data" });
        done();
      });
    });

    it('should handle a PUT request and parse the results (callback), enforce method', (done) => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.put('https://someurl.not', (err, res) => {
        expect(res).to.eql({ data: "data" });
        done();
      });
    });

  });

  describe('delete()', () => {

    beforeEach(() => {
      this.request = sinon.stub(https, 'request');
    });

    afterEach(() => {
      https.request.restore();
    });

    it('should handle a DELETE request and parse the results (promise)', () => {
      let mockRes = null;

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      return webreq.delete('https://someurl.not/id/1', { method: 'DELETE' }).then(res => {
        expect(res).to.be.null;
      });
    });

    it('should handle a DELETE request and parse the results (callback)', (done) => {
      let mockRes = null;
      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.delete('https://someurl.not/id/1', { method: 'DELETE' }, (err, res) => {
        expect(res).to.be.null;
        done();
      });
    });

    it('should handle a DELETE request and parse the results (promise), enforce method', () => {
      let mockRes = null;

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      return webreq.delete('https://someurl.not/id/1').then(res => {
        expect(res).to.be.null;
      });
    });

    it('should handle a DELETE request and parse the results (callback), enforce method', (done) => {
      let mockRes = null;
      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.delete('https://someurl.not/id/1', (err, res) => {
        expect(res).to.be.null;
        done();
      });
    });

  });

  describe('patch()', () => {

    beforeEach(() => {
      this.request = sinon.stub(https, 'request');
    });

    afterEach(() => {
      https.request.restore();
    });

    it('should handle a PATCH request and parse the results (promise)', (done) => {
      let params = { foo: 'bar' };
      let paramsString = JSON.stringify(params);

      let request = new PassThrough();
      let write = sinon.spy(request, 'write');

      this.request.returns(request);

      webreq.patch('https://someurl.not/id/1', { method: 'PATCH', body: paramsString }).then(() => { });

      assert(write.withArgs(paramsString).calledOnce);
      done();
    });

    it('should handle a PATCH request and parse the results (callback)', (done) => {
      let params = { foo: 'bar' };
      let paramsString = JSON.stringify(params);

      let request = new PassThrough();
      let write = sinon.spy(request, 'write');

      this.request.returns(request);

      webreq.patch('https://someurl.not/id/1', { method: 'PATCH', body: paramsString }, () => { });
      assert(write.withArgs(paramsString).calledOnce);
      done();
    });

    it('should handle a PATCH request and parse the results (promise), enforce method', (done) => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.patch('https://someurl.not/id/1').then(res => {
        expect(res).to.eql({ data: "data" });
        done();
      });
    });

    it('should handle a PATCH request and parse the results (callback), enforce method', (done) => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      webreq.patch('https://someurl.not', (err, res) => {
        expect(res).to.eql({ data: "data" });
        done();
      });
    });

  });

  describe('configureGlobalAgent()', () => {
    it('should configure the global agent settings of webreq (http/https)', () => {
      let httpMs = http.globalAgent.maxSockets;
      let httpMfs = http.globalAgent.maxFreeSockets;
      let httpsMs = https.globalAgent.maxSockets;
      let httpsMfs = https.globalAgent.maxFreeSockets;

      webreq.configureGlobalAgent({ maxSockets: 200, maxFreeSockets: 210 });
      expect(http.globalAgent.maxSockets).to.equal(200);
      expect(http.globalAgent.maxFreeSockets).to.equal(210);
      expect(https.globalAgent.maxSockets).to.equal(200);
      expect(https.globalAgent.maxFreeSockets).to.equal(210);

      http.globalAgent.maxSockets = httpMs;
      http.globalAgent.maxFreeSockets = httpMfs;
      https.globalAgent.maxSockets = httpsMs;
      https.globalAgent.maxFreeSockets = httpsMfs;
    });

    it('should configure the global agent settings of webreq (http/https), no settings, leave default settings', () => {
      webreq.configureGlobalAgent();
      expect(http.globalAgent.maxSockets).to.equal(Infinity);
      expect(http.globalAgent.maxFreeSockets).to.equal(256);
      expect(https.globalAgent.maxSockets).to.equal(Infinity);
      expect(https.globalAgent.maxFreeSockets).to.equal(256);
    });
  });

  describe('On Error', () => {

    beforeEach(() => {
      this.request = sinon.stub(https, 'request');
    });

    afterEach(() => {
      https.request.restore();
    });

    it('should handle errors (promise)', (done) => {
      var mockError = 'An error has occured';
      var request = new PassThrough();

      this.request.returns(request);

      webreq.request('https://someurl.not').then(res => {

      }).catch(err => {
        expect(err).to.equal(mockError);
        done();
      });

      request.emit('error', mockError);
    });
  });

  describe('Get with HTTP', () => {

    beforeEach(() => {
      this.request = sinon.stub(http, 'request');
    });

    afterEach(() => {
      http.request.restore();
    });

    it('should handle a GET HTTP request', () => {
      let mockRes = { data: "data" };

      let response = new PassThrough();
      response.headers = { 'content-type': 'application/json' }
      response.statusCode = 200;

      response.write(JSON.stringify(mockRes));
      response.end();

      let request = new PassThrough();

      this.request.callsArgWith(1, response).returns(request);

      return webreq.request('http://someurl.not').then(res => {
        expect(res).to.eql({ data: "data" });
      });
    });
  });
});
