const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('seneca-web-error-handler', () => {
  let fn;
  const sandbox = sinon.sandbox.create();
  const req = {
    response: {},
  };
  const reply = sandbox.stub();
  const replyWithRedirect = {
    redirect: sandbox.stub(),
  };
  const BoomMock = {
    boomify: msg => `Boom! ${msg}`,
  };

  lab.before((done) => {
    fn = proxy('../../web/lib/seneca-web-error-handler.js', {
      boom: BoomMock,
    });
    done();
  });

  lab.afterEach((done) => {
    req.response = {};
    sandbox.reset();
    done();
  });
  lab.test('it should format the response with an error code', (done) => {
    req.response.http$ = { status: 404 };
    req.response.data = 'Not allowed';
    fn(req, reply);
    expect(reply).to.have.been.calledOnce;
    expect(reply).to.have.been.calledWith('Boom! Not allowed');
    done();
  });

  lab.test('it should redirect to a specific page', (done) => {
    req.response.http$ = { redirect: 'http://google.com' };
    fn(req, replyWithRedirect);
    expect(replyWithRedirect.redirect).to.have.been.calledOnce;
    expect(replyWithRedirect.redirect).to.have.been.calledWith(req.response.http$.redirect);
    done();
  });
  lab.test('it should use the current info', (done) => {
    fn(req, reply);
    expect(reply).to.have.been.calledOnce;
    expect(reply).to.have.been.calledWith(req.response);
    done();
  });
});
