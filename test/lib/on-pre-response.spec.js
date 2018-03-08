const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fn = require('../../web/lib/on-pre-response.js');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('onPreResponse', () => {
  const server = {};
  lab.before((done) => {
    server.app = {
      hostUid: 1,
    };
    done();
  });
  // TODO : integration test, not sure the field are still up to date
  lab.test('should set headers for cp-host for response', (done) => {
    const reqMock = {
      url: { path: '' },
      response: {
        header: sinon.spy(),
      },
      app: { context: {} },
      headers: {},
    };
    const replyMock = {
      continue: sinon.stub(),
    };

    fn(server)(reqMock, replyMock);
    expect(reqMock.response.header).to.have.been.calledWith('cp-host', server.app.hostUid);
    done();
  });
  lab.test('should set headers for cp-host for error', (done) => {
    const reqMock = {
      url: { path: '' },
      response: {
        output: {
          headers: {},
        },
      },
      app: { context: {} },
      headers: {},
    };
    const replyMock = {
      continue: sinon.stub(),
    };

    fn(server)(reqMock, replyMock);
    expect(reqMock.response.output.headers['cp-host']).to.equal(server.app.hostUid);
    done();
  });

  lab.test('should specifically log on 400', (done) => {
    const reqMock = {
      url: { path: '' },
      response: {
        output: {
          statusCode: 400,
          headers: {},
        },
      },
      user: { id: 1 },
      payload: { a: 'a' },
      params: { query: 'query' },
      log: sinon.spy(),
      app: { context: {} },
      headers: {},
    };
    const replyMock = {
      continue: sinon.stub(),
    };

    fn(server)(reqMock, replyMock);
    expect(reqMock.log).to.have.been.calledWith(['error', '400'],
      {
        status: 400,
        host: server.app.hostUid,
        payload: reqMock.payload,
        params: reqMock.params,
        url: reqMock.url,
        user: reqMock.user,
        error: { headers: { 'cp-host': 1 }, statusCode: 400 },
      },
      sinon.match.number);
    expect(replyMock.continue).to.have.been.calledOnce;
    done();
  });

  lab.test('should continue for any api 2.0 endpoint', (done) => {
    const reqMock = {
      url: { path: '/api/2.0/dojos' },
      response: {
        output: {
          statusCode: 500,
          headers: {},
        },
      },
      log: sinon.stub(),
      app: { context: {} },
      headers: {},
    };
    const replyMock = {
      continue: sinon.spy(),
    };

    fn(server)(reqMock, replyMock);
    expect(replyMock.continue).to.have.been.calledOnce;
    done();
  });

  lab.test('should continue for any api 3.0 endpoint', (done) => {
    const reqMock = {
      url: { path: '/api/3.0/dojos' },
      response: {
        output: {
          statusCode: 500,
          headers: {},
        },
      },
      log: sinon.stub(),
      app: { context: {} },
      headers: {},
    };
    const replyMock = {
      continue: sinon.spy(),
    };

    fn(server)(reqMock, replyMock);
    expect(replyMock.continue).to.have.been.calledOnce;
    done();
  });

  lab.test('should redirect to cdf login on auth error for cdf pages', (done) => {
    const reqMock = {
      url: { path: '/' },
      response: {
        output: {
          statusCode: 403,
          headers: {},
        },
      },
      route: { settings: { auth: { access: [{ scope: { selection: ['cdf-admin'] } }] } } },
      app: { context: {} },
      headers: {},
    };
    const replyMock = {
      redirect: sinon.spy(),
      continue: sinon.spy(),
    };

    fn(server)(reqMock, replyMock);
    expect(replyMock.redirect).to.have.been.calledOnce;
    expect(replyMock.redirect).to.have.been.calledWith('/cdf/login?next=/');
    expect(replyMock.redirect).to.have.returned(sinon.match.any);
    expect(replyMock.continue).to.not.have.been.called;
    done();
  });

  lab.test('should continue for anything that is not a 404 or a 401', (done) => {
    const reqMock = {
      url: { path: '' },
      response: {
        output: {
          statusCode: 200,
          headers: {},
        },
      },
      app: { context: {} },
      headers: {},
    };
    const replyMock = {
      continue: sinon.spy(),
    };

    fn(server)(reqMock, replyMock);
    expect(replyMock.continue).to.have.been.calledOnce;
    done();
  });

  lab.test('ultimately should render the index view', (done) => {
    const reqMock = {
      url: { path: '' },
      response: {
        output: {
          statusCode: 404,
          headers: {},
        },
      },
      log: sinon.stub(),
      app: { context: {} },
      headers: {},
    };
    const replyMock = {
      view: sinon.stub(),
      continue: sinon.spy(),
    };

    fn(server)(reqMock, replyMock);
    expect(replyMock.view).to.have.been.calledOnce;
    expect(replyMock.view).to.have.been.calledWith('index', reqMock.app);
    expect(replyMock.continue).to.not.have.been.called;
    done();
  });
});
