const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('dojo handler', () => {
  const fn = proxy('../../../web/lib/handlers/dojo.js', {
    '../mastermind': cbs => cbs,
  });
  const sandbox = sinon.sandbox.create();
  const user = { id: 'user1' };
  const seneca = { act: sinon.stub() };
  const sitemapRefreshStub = sandbox.stub();
  const req = {
    params: { id: 1 },
    payload: { verified: 1 },
    user,
    seneca,
    server: {
      plugins: {
        sitemap: {
          refresh: sitemapRefreshStub,
        },
      },
    },
  };
  const reply = sandbox.stub();
  const code = sandbox.stub();
  const cb = sandbox.stub();
  lab.beforeEach((done) => {
    reply.returns({
      code,
    });
    done();
  });
  lab.afterEach((done) => {
    sandbox.reset();
    done();
  });
  lab.describe('verify', () => {
    const dojo = { id: 1, verified: 1 };
    const err = new Error('fake err');
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should return the dojo', (done) => {
      seneca.act.callsFake((args, _cb) => _cb(null, dojo));
      fn.verify()[0](req, reply, cb);
      expect(seneca.act).to.have.been.calledWith({
        role: 'cd-dojos',
        ctrl: 'dojo',
        cmd: 'verify',
        id: 1,
        verified: 1,
        user,
      }, sinon.match.func);
      expect(reply).to.have.been.calledOnce;
      expect(reply).to.have.been.calledWith(dojo);
      expect(code).to.have.been.calledOnce;
      expect(code).to.have.been.calledWith(200);
      expect(cb).to.have.been.called;
      done();
    });
    lab.test('it should call cb on error', (done) => {
      seneca.act.callsFake((args, _cb) => _cb(err));
      fn.verify()[0](req, reply, cb);
      expect(seneca.act).to.have.been.calledWith({
        role: 'cd-dojos',
        ctrl: 'dojo',
        cmd: 'verify',
        id: 1,
        verified: 1,
        user,
      }, sinon.match.func);
      expect(cb).to.have.been.calledOnce;
      expect(cb.getCall(0).args[0].statusCode).to.be.undefined;
      expect(reply).to.not.have.been.called;
      done();
    });
    lab.test('it should call cb on error with custom bypass for handled error', (done) => {
      const formattedErr = new Error('Dojo email is missing');
      seneca.act.callsFake((args, _cb) => _cb(formattedErr));
      fn.verify()[0](req, reply, cb);
      expect(seneca.act).to.have.been.calledWith({
        role: 'cd-dojos',
        ctrl: 'dojo',
        cmd: 'verify',
        id: 1,
        verified: 1,
        user,
      }, sinon.match.func);
      expect(cb).to.have.been.calledOnce;
      expect(cb.getCall(0).args[0].statusCode).to.equal(400);
      expect(cb.getCall(0).args[0].message).to.equal('Dojo email is missing');
      expect(reply).to.not.have.been.called;
      done();
    });
    lab.test('it should call refresh on sitemap and cb', (done) => {
      fn.verify()[1](req, reply, cb);
      expect(sitemapRefreshStub).to.have.been.calledOnce;
      expect(cb).to.have.been.calledOnce;
      done();
    });
  });
});
