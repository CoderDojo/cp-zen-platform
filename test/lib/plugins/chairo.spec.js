const chai = require('chai');
const lab = require('lab').script();
const hapiFactory = require('../../../web/index');

const expect = chai.expect;
exports.lab = lab;
lab.describe('chairo', () => {
  let server;
  lab.before(done => {
    hapiFactory.start().then(_server => {
      server = _server;
      done();
    });
  });
  lab.test('should set up seneca communication', done => {
    server.inject('/', res => {
      expect(res.request.seneca).to.be.an('object');
      expect(server.seneca).to.be.an('object');
      done();
    });
  });
  // chairo-cache is meant to work w/ seneca-web.
  // It's setup in hapi but not in the back-end
  lab.test.skip('should cache seneca requests');
  lab.after(done => {
    server.stop(done);
  });
});
