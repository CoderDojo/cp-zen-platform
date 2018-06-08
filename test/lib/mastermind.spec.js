const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const boom = require('boom');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('masterMind', () => {
  let sandbox;
  let firstStep;
  let secondStep;
  let failingStep;
  let finalHandler;
  let boomSpy;
  let fn;
  let reply;
  const req = {};
  const error = new Error('fake err');
  lab.before((done) => {
    sandbox = sinon.sandbox.create();
    boomSpy = sandbox.spy(boom, 'boomify');
    done();
  });
  lab.beforeEach((done) => {
    reply = sandbox.stub();
    firstStep = sandbox.stub().callsFake((_req, _reply, _cb) => _cb());
    secondStep = sandbox.stub().callsFake((_req, _reply) => _reply());
    failingStep = sandbox.stub().callsFake((_req, _reply, _cb) => _cb(error));
    finalHandler = sandbox.stub();
    fn = proxyquire('../../web/lib/mastermind.js', {
      'boom': boomSpy, // eslint-disable-line quote-props
    });
    done();
  });
  lab.afterEach((done) => {
    sandbox.reset();
    done();
  });
  lab.test('it should call all steps with (req, reply, cb)', (done) => {
    fn([firstStep, secondStep])(req, reply);
    expect(firstStep).to.have.been.calledOnce;
    expect(firstStep).to.have.been.calledWith(req, reply, sinon.match.func);
    expect(secondStep).to.have.been.calledOnce;
    done();
  });
  lab.test('it should handle errors if any step fails', (done) => {
    fn([firstStep, failingStep, secondStep])(req, reply);
    expect(firstStep).to.have.been.calledOnce;
    expect(firstStep).to.have.been.calledWith(req, reply, sinon.match.func);
    expect(failingStep).to.have.been.calledOnce;
    expect(secondStep).to.not.have.been.called;
    expect(boomSpy).to.have.been.calledOnce;
    expect(boomSpy).to.have.been.calledWith(error);
    done();
  });
  lab.test('it should bypass the default final handler', (done) => {
    fn([firstStep, failingStep], finalHandler)(req, reply);
    expect(finalHandler).to.have.been.calledOnce;
    expect(finalHandler).to.have.been.calledWith();
    done();
  });
});
