const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('cp-permissions preHandler', () => {
  let fn;
  const sandbox = sinon.sandbox.create();
  const reply = sandbox.stub();
  reply.continue = sandbox.stub();
  const BoomMock = {
    forbidden: sandbox.stub(),
  };
  const checkProfilesMock = sandbox.stub();
  const logMock = sandbox.stub();
  let req;

  lab.before((done) => {
    fn = proxy('../../web/lib/cp-permissions-pre-handler.js', {
      boom: BoomMock,
      'cp-permissions-plugin': { checkProfiles: checkProfilesMock },
    });
    done();
  });

  lab.beforeEach((done) => {
    req = {
      seneca: {},
      log: logMock,
      route: {
        settings: {
          plugins: {
            cpPermissions: {
              profiles: [],
            },
          },
        },
      },
      app: {
        hostUid: 'foo',
      },
      payload: {},
      params: {},
      url: 'some url',
      user: {
        user: {
          name: 'some user',
        },
      },
    };
    BoomMock.forbidden.returns('Verboten');
    done();
  });

  lab.afterEach((done) => {
    sandbox.reset();
    done();
  });

  lab.test('should continue if no permisConfig it present', (done) => {
    // ARRANGE
    req.route.settings.plugins = {};

    // ACT
    fn(req, reply);

    // ASSERT
    expect(reply.continue).to.have.been.calledOnce;
    done();
  });

  lab.test('should include query, payload and parms in the checkProfiles call', (done) => {
    // ARRANGE
    req = Object.assign(req, {
      query: {
        key1: 'qval1',
        key2: 'qval2',
      },
      payload: {
        key2: 'payload_val2',
        key3: 'payload_val3',
        key4: 'payload_val4',
      },
      params: {
        key4: 'params_val4',
        key5: 'params_val5',
      },
    });
    const expectedMsg = {
      params: {
        key1: 'qval1',
        key2: 'payload_val2',
        key3: 'payload_val3',
        key4: 'params_val4',
        key5: 'params_val5',
      },
      user: {
        name: 'some user',
      },
    };

    // ACT
    fn(req, reply);

    // ASSERT
    expect(checkProfilesMock).to.have.been.calledOnce;
    expect(checkProfilesMock).to.have.been.calledWith([], expectedMsg, sinon.match.func);
    done();
  });

  lab.test('should reply with forbidden if checkProfiles throws an error', (done) => {
    // ARRANGE
    const err = new Error();
    checkProfilesMock.callsFake((profiles, msg, cb) => {
      cb(err);
    });

    // ACT
    fn(req, reply);

    // ASSERT
    expect(logMock).to.have.been.calledOnce;
    expect(logMock).to.have.been.calledWith(
      ['error', '50x'],
      {
        status: '403',
        host: 'foo',
        payload: {},
        params: {},
        url: 'some url',
        user: {
          user: { name: 'some user' },
        },
        error: err,
      },
      sinon.match.number,
    );
    expect(reply).to.have.been.calledOnce;
    expect(reply).to.have.been.calledWith('Verboten');
    done();
  });

  lab.test('should reply with forbidden if checkProfiles responds with allowed: false', (done) => {
    // ARRANGE
    checkProfilesMock.callsFake((profiles, msg, cb) => {
      cb(null, { allowed: false });
    });

    // ACT
    fn(req, reply);

    // ASSERT
    expect(logMock).to.have.been.calledOnce;
    expect(logMock).to.have.been.calledWith(
      ['error', '40x'],
      {
        status: '403',
        host: 'foo',
        payload: {},
        params: {},
        url: 'some url',
        user: {
          user: { name: 'some user' },
        },
        error: { allowed: false },
      },
      sinon.match.number,
    );
    expect(reply).to.have.been.calledOnce;
    expect(reply).to.have.been.calledWith('Verboten');
    done();
  });

  lab.test('should continue if checkProfiles responds with allowed: true', (done) => {
    // ARRANGE
    checkProfilesMock.callsFake((profiles, msg, cb) => {
      cb(null, { allowed: true });
    });

    // ACT
    fn(req, reply);

    // ASSERT
    expect(reply.continue).to.have.been.calledOnce;
    done();
  });
});
