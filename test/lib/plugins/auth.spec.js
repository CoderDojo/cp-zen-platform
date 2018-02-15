const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fn = require('../../../web/lib/plugins/auth');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('auth', () => {
  const sandbox = sinon.sandbox.create();
  const serverStub = {
    register: (plugin, cb) => cb(), // We manually bypass plugin reg
    auth: {
      strategy: sandbox.spy(),
    },
  };
  const nextStub = sandbox.spy();
  sandbox.spy(serverStub, 'register');
  const getUser = fn.register.attributes.fns.getUser;
  const validateFunc = fn.register.attributes.fns.validateFunc;
  lab.beforeEach((done) => {
    sandbox.reset();
    done();
  });
  lab.test('should register hapi-auth-cookie', (done) => {
    fn.register(serverStub, {}, nextStub);
    expect(serverStub.register).to.have.been.calledOnce;
    done();
  });

  lab.test('should create an authentication strategy', (done) => {
    fn.register(serverStub, {}, nextStub);
    expect(serverStub.auth.strategy).to.have.been
      .calledWith('seneca-login', 'cookie', sinon.match.object);
    expect(nextStub).to.have.been.calledOnce;
    done();
  });
  lab.test('should get the user if there is a token', (done) => {
    const reqMock = {
      seneca: {
        act: (args, cb) => cb(null, { ok: true }),
      },
    };
    const senecaActSpy = sinon.spy(reqMock.seneca, 'act');
    const cbSpy = sinon.spy();
    getUser(reqMock, 'tokenMock', cbSpy);
    expect(senecaActSpy).to.have.been
      .calledWith({ role: 'user', cmd: 'auth', token: 'tokenMock' }, sinon.match.func);
    expect(cbSpy).to.have.been.calledWith(null, { ok: true });
    done();
  });

  lab.test('should fail if the token doesnt exists', (done) => {
    const reqMock = {
      seneca: {
        act: (args, cb) => cb(null, { ok: false }),
      },
    };
    const senecaActSpy = sinon.spy(reqMock.seneca, 'act');
    const cbSpy = sinon.spy();
    getUser(reqMock, 'tokenMock', cbSpy);
    expect(senecaActSpy).to.have.been
      .calledWith({ role: 'user', cmd: 'auth', token: 'tokenMock' }, sinon.match.func);
    expect(cbSpy).to.have.been.calledWith('login not ok');
    done();
  });

  lab.test('should skip the retrieval of user if there is no token', (done) => {
    const reqMock = {
      seneca: {
        act: (args, cb) => cb(),
      },
    };
    const senecaActSpy = sinon.spy(reqMock.seneca, 'act');
    getUser(reqMock, '', (...args) => {
      expect(senecaActSpy).to.not.have.been.called;
      expect(args.length).to.be.equal(0);
      done();
    });
  });
  lab.test('should validate a token and set the cdf scope', (done) => {
    const serverMock = {};
    const reqMock = {
      seneca: { act: sinon.stub() },
      route: {
        settings: {
          auth: {
            access: [{ scope: { selection: ['cdf-admin'] } }],
          },
        },
      },
    };
    const sessionMock = {
      token: 'token',
      target: 'cdf',
    };
    const cbSpy = sinon.spy();
    validateFunc(serverMock)(reqMock, sessionMock, cbSpy);
    reqMock.seneca.act.callArgWith(1, null,
      { ok: true, user: { roles: ['cdf-admin'] } });
    expect(cbSpy).to.have.been.calledWith(null, true, { scope: 'cdf-admin' });
    done();
  });
  lab.test('should validate a token and set the basic-user scope for anything else', (done) => {
    const serverMock = {};
    const reqMock = {
      seneca: { act: sinon.stub() },
      route: {
        settings: {
          auth: {
            access: [{ scope: { selection: ['gloubiboulga'] } }],
          },
        },
      },
    };
    const sessionMock = {
      token: 'token',
      target: 'bananas',
    };
    const cbSpy = sinon.spy();
    validateFunc(serverMock)(reqMock, sessionMock, cbSpy);
    reqMock.seneca.act.callArgWith(1, null,
      { ok: true, user: { roles: ['cdf-admin'] } });
    expect(cbSpy).to.have.been.calledWith(null, true, { scope: 'basic-user' });
    done();
  });
  lab.test('should validate a token and set the basic-user scope for anything else', (done) => {
    const serverMock = { app: { hostUid: '' } };
    const reqMock = {
      seneca: { act: sinon.stub() },
      route: {
        settings: {
          auth: {
            access: [{ scope: { selection: ['gloubiboulga'] } }],
          },
        },
      },
      log: sinon.spy(),
    };
    const sessionMock = {
      token: 'token',
      target: 'bananas',
    };
    const cbSpy = sinon.spy();
    validateFunc(serverMock)(reqMock, sessionMock, cbSpy);
    reqMock.seneca.act.callArgWith(1, null, { ok: false });
    expect(reqMock.log).to.have.been.calledOnce;
    expect(cbSpy).to.have.been.calledWith(null, false);
    done();
  });
});
