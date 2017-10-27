const chai = require('chai');
const lab = require('lab').script();
const serverFactory = require('../web/index');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.experiment('setup server', () => {
  let server;
  lab.before((done) => {
    serverFactory.start()
    .then((_server) => {
      server = _server;
      done();
    });
  });
  lab.test('should load plugins', (done) => {
    expect(Object.keys(server.registrations).length).to.be.equal(35);
    done();
  });
  lab.test('should set cors', (done) => {
    server.inject('/', (res) => {
      expect(res.headers['access-control-allow-credentials']).to.equal(true);
      expect(res.headers['access-control-allow-headers']).to.equal('Authorization,Content-Type,If-None-Match');
      expect(res.headers['access-control-allow-methods']).to.equal('GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
      expect(res.headers['access-control-allow-origin']).to.include('https://changex.org https://coderdojo.com http://localhost');
      expect(res.headers['access-control-expose-headers']).to.equal('WWW-Authenticate,Server-Authorization');
      expect(res.headers['access-control-max-age']).to.equal('86400');
      done();
    });
  });

  // lab.describe('onRequest', () => {
  //   lab.test('should set onRequest if env is prod or staging');
  //   lab.test('should not set onRequest');
  // });

  lab.describe('methods', () => {
    lab.test('should define locality', (done) => {
      expect(server.methods.locality).to.be.a('function');
      done();
    });
  });
  lab.describe('server.app constants', () => {
    lab.test('should set hostUid', (done) => {
      expect(server.app.hostUid).to.be.a('string');
      done();
    });
  });
  // lab.test('should register onPreAuth', (done) => {
  //   done();
  // });
  //
  // lab.test('should register onPreResponse', (done) => {
  //   done();
  // });
  //
  // lab.test('shoud register http-error-handler onPreResponse-2', (done) => {
  //   done();
  // });
});
