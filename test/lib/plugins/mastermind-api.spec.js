const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fn = require('../../../web/lib/plugins/mastermind-api');
const senecaHttpErrorHandler = require('../../../web/lib/seneca-web-error-handler');
const cpPermissionsPreHandler = require('../../../web/lib/cp-permissions-pre-handler');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('mastermind-api', () => {
  const sandbox = sinon.sandbox.create();
  const server = {
    route: sandbox.stub(),
    ext: sandbox.stub(),
  };
  const next = sandbox.stub();
  lab.afterEach(done => {
    sandbox.reset();
    done();
  });
  lab.test('should register the api routes', done => {
    fn.register(server, null, next);
    expect(server.route).to.have.been.called;
    expect(next).to.have.been.calledOnce;
    done();
  });

  lab.test('should register a scoped postResponse', done => {
    fn.register(server, null, next);
    expect(server.ext).to.have.been.calledTwice;
    expect(server.ext).to.have.been.calledWith(
      'onPreResponse',
      senecaHttpErrorHandler,
      { sandbox: 'plugin' }
    );
    expect(server.ext).to.have.been.calledWith(
      'onPreHandler',
      cpPermissionsPreHandler,
      { sandbox: 'plugin' }
    );
    expect(next).to.have.been.calledOnce;
    done();
  });
});
