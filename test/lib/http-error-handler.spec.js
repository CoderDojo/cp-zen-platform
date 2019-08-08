const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('http-error-handler', () => {
  const server = {};
  let fn;
  const boomMock = {
    badImplementation: sinon.stub().returns('badImplementation'),
    badRequest: sinon.stub().returns('badRequest'),
  };
  lab.before(done => {
    server.app = {};
    fn = proxy('../../web/lib/http-error-handler.js', { boom: boomMock });
    done();
  });
  lab.beforeEach(done => {
    boomMock.badImplementation.resetHistory();
    boomMock.badRequest.resetHistory();
    done();
  });
  lab.test(
    'should default statusCode to 500 and transform into a badImplementation',
    done => {
      const reqMock = {
        app: { context: {} },
        headers: {},
        response: {
          isBoom: false,
        },
        log: sinon.stub(),
      };
      const replyMock = sinon.spy();
      fn(server)(reqMock, replyMock);
      expect(replyMock).to.have.been.calledOnce;
      expect(replyMock).to.have.been.calledWith('badImplementation');
      expect(boomMock.badImplementation).to.have.been.calledOnce;
      done();
    }
  );
  lab.test('should continue if request isBoom', done => {
    const reqMock = {
      app: { context: {} },
      headers: {},
      response: {
        isBoom: true,
      },
      log: sinon.stub(),
      statusCode: 400,
    };
    const replyMock = {
      continue: sinon.spy(),
    };
    fn(server)(reqMock, replyMock);
    expect(replyMock.continue).to.have.been.calledOnce;
    done();
  });
  lab.test('should forge a badRequest on 400', done => {
    const reqMock = {
      app: { context: {} },
      headers: {},
      response: {
        statusCode: 400,
        isBoom: false,
        output: { payload: { message: 'banana' } },
      },
      log: sinon.stub(),
    };
    const replyMock = sinon.spy();
    fn(server)(reqMock, replyMock);
    expect(replyMock).to.have.been.calledOnce;
    expect(replyMock).to.have.been.calledWith('badRequest');
    expect(boomMock.badRequest).to.have.been.calledOnce;
    expect(boomMock.badRequest).to.have.been.calledWith(
      reqMock.response.output.payload.message
    );
    done();
  });
  lab.test('should continue on 410', done => {
    const reqMock = {
      app: { context: {} },
      headers: {},
      response: {
        statusCode: 410,
        isBoom: false,
      },
      log: sinon.stub(),
    };
    const replyMock = {
      continue: sinon.spy(),
    };
    fn(server)(reqMock, replyMock);
    expect(replyMock.continue).to.have.been.calledOnce;
    done();
  });
  lab.test('should continue if the http status code < 400 ', done => {
    const reqMock = {
      app: { context: {} },
      headers: {},
      response: {
        statusCode: 301,
      },
    };
    const replyMock = {
      continue: sinon.spy(),
    };
    fn(server)(reqMock, replyMock);
    expect(replyMock.continue).to.have.been.calledOnce;
    done();
  });
});
