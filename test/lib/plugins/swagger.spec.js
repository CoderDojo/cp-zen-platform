const chai = require('chai');
const lab = require('lab').script();
const hapiFactory = require('../../../web/index');

const expect = chai.expect;
exports.lab = lab;
lab.describe('swagger', () => {
  let server;
  lab.before((done) => {
    hapiFactory.start()
      .then((_server) => { server = _server; done(); });
  });
  lab.test('should set up swagger api', (done) => {
    server.inject('/documentation', (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });
  lab.after((done) => {
    server.stop(done);
  });
});
