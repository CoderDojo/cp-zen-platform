const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fn = require('../../../web/lib/plugins/mastermind-api');
const senecaHttpErrorHandler = require('../../../web/lib/seneca-web-error-handler');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('mastermind-api', () => {
  const sandbox = sinon.sandbox.create();
  const server = {
    register: sandbox.stub(),
    ext: sandbox.stub(),
  };
  const next = sandbox.stub();
  lab.afterEach((done) => {
    sandbox.reset();
    done();
  });
  lab.test('should register the api routes', (done) => {
    fn.register(server, null, next);
    expect(server.register).to.have.been.called;
    expect(next).to.have.been.calledOnce;
    done();
  });

  lab.test('should call next on error', (done) => {
    const error = new Error('fake err');
    server.register.reset();
    server.register.callsFake((plugin, cb) => cb(error));
    fn.register(server, null, next);
    expect(next).to.have.been.calledTwice;
    expect(next).to.have.been.calledWith(error);
    done();
  });

  lab.test('should register a scoped postResponse', (done) => {
    fn.register(server, null, next);
    expect(server.ext).to.have.been.calledOnce;
    expect(server.ext).to.have.been.calledWith('onPreResponse', senecaHttpErrorHandler, { sandbox: 'plugin' });
    expect(next).to.have.been.calledOnce;
    done();
  });
});
