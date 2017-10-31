const chai = require('chai');
const lab = require('lab').script();
const serverFactory = require('../web/index');

const expect = chai.expect;
exports.lab = lab;
lab.experiment('setup server', () => {
  let server;
  lab.before((done) => {
    serverFactory.start()
      .then((_server) => {
        server = _server;
        server.seneca.act = function (args, cb) { if (cb) { cb(null, {}); } };
        done();
      });
  });
  lab.describe('should load plugins', () => {
    lab.test('to be always the same length', (done) => {
      let expectedQty = 34;
      // Set up good
      if (process.env.HAPI_DEBUG === 'true' || process.env.LOGENTRIES_ENABLED === 'true') {
        expectedQty += 1;
      }
      // Set up onRequest x-forwarded-proto
      if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        expectedQty += 1;
      }
      expect(Object.keys(server.registrations).length).to.be.equal(expectedQty);
      done();
    });
    // lab.test('should set onRequest if env is prod or staging');
    // lab.test('should not set onRequest');
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
  lab.describe('should set cors', () => {
    lab.test('when GET on same domain, no headers', (done) => {
      server.inject('/api/2.0/dojos/user-permissions', (res) => {
        expect(res.headers).not.to.have.keys('access-control-allow-origin');
        expect(res.headers).not.to.have.keys('access-control-allow-credentials');
        // expect(res.statusCode).to.be.equal(401); // Inject does not apply browser restrictions
        done();
      });
    });
    lab.test('when POST on same domain, no headers', (done) => {
      server.inject({ method: 'POST', url: '/api/2.0/dojos/dojo-stats' }, (res) => {
        expect(res.headers).not.to.have.keys('access-control-allow-origin');
        expect(res.headers).not.to.have.keys('access-control-allow-credentials');
        // expect(res.statusCode).to.be.equal(401); // Inject does not apply browser restrictions
        done();
      });
    });
    lab.test('when on different domain, should block with no CORS', (done) => {
      server.inject({ method: 'GET',
        url: '/api/2.0/dojos/user-permissions',
        headers: { origin: 'http://google.com' } }, (res) => {
        // Should have no headers because different domain which is not a valid one
        expect(res.headers).to.not.have.keys('access-control-allow-origin');
        expect(res.headers).to.not.have.keys('access-control-allow-credentials');
        // expect(res.statusCode).to.be.equal(401); // Inject does not apply browser restrictions
        done();
      });
    });
    lab.test('overwrite CORS to *', (done) => {
      server.inject({ method: 'POST',
        url: '/api/2.0/dojos',
        headers: { origin: 'http://localhost:8000' } },
      (res) => {
        expect(res.headers['access-control-allow-credentials']).to.be.undefined;
        expect(res.headers['access-control-allow-origin']).to.equal('http://localhost:8000');
        expect(res.headers['access-control-expose-headers']).to.equal('WWW-Authenticate,Server-Authorization,cp-host');
        done();
      });
    });
    lab.test('should allow external domains', (done) => {
      server.inject({ method: 'POST',
        url: '/api/2.0/dojos/load-dojo-users',
        headers: { origin: 'https://changex.org' } },
      (res) => {
        expect(res.headers['access-control-allow-credentials']).to.be.equal('true');
        expect(res.headers['access-control-allow-origin']).to.equal('https://changex.org');
        expect(res.headers['access-control-expose-headers']).to.equal('WWW-Authenticate,Server-Authorization,cp-host');
        done();
      });
    });
  });

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

  lab.after((done) => {
    server.stop(done);
  });
});
