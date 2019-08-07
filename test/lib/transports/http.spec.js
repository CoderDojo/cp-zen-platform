const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('request-promise-native');
const Fn = require('../../../web/lib/transports/http');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('HTTP transport', () => {
  const sandbox = sinon.sandbox.create();
  lab.afterEach(done => {
    sandbox.reset();
    done();
  });
  lab.it('should initialize a transport with params from the model', done => {
    const spy = sinon.spy(request, 'defaults');
    const payload = {
      baseUrl: 'http://google.com',
    };
    // eslint-disable-next-line no-new
    new Fn(payload);
    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith(payload);
    done();
  });
});
