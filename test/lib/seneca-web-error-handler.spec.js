const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fn = require('../../web/lib/seneca-web-error-handler.js');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('seneca-web-error-handler', () => {
  const sandbox = sinon.sandbox.create();
  const req = {
    response: {},
  };
  const code = sandbox.stub();
  const reply = sandbox.stub().returns({
    code,
  });
  const replyWithRedirect = {
    redirect: sandbox.stub(),
  };
  lab.afterEach((done) => {
    req.response = {};
    sandbox.reset();
    reply.returns({
      code,
    });
    done();
  });
  lab.test('it should format the response with an error code', (done) => {
    req.response.http$ = { status: 404 };
    req.response.data = 'Not allowed';
    fn(req, reply);
    expect(reply).to.have.been.calledOnce;
    expect(reply).to.have.been.calledWith('Not allowed');
    expect(code).to.have.been.calledOnce;
    expect(code).to.have.been.calledWith(404);
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
    expect(code).to.have.been.calledOnce;
    expect(code).to.have.been.calledWith(200);
    done();
  });
});
