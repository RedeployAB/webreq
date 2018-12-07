const { expect } = require('chai');
const Response = require('../lib/response');

describe('Response', () => {

  it('should create a response object', (done) => {
    let response = new Response(200, { 'Content-Type': 'application/json' }, { data: 'response body' });

    expect(response instanceof Response).to.be.true;
    expect(response.statusCode).to.equal(200);
    expect(response.headers['Content-Type']).to.equal('application/json');
    expect(response.body).to.be.an('Object');

    done();
  });
});
