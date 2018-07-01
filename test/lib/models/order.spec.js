const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('order handler', () => {
  const sandbox = sinon.sandbox.create();
  const transport = {
    get: sandbox.stub(),
    post: sandbox.stub(),
  };
  const transportFactory = sandbox.stub().returns(transport);

  const fn = proxy('../../../web/lib/models/order.js', {
    '../transports/http': transportFactory,
  });
  lab.afterEach((done) => {
    sandbox.reset();
    done();
  });
  lab.describe('GET', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the GET call', async () => {
      const qs = {
        'query[eventId]': 1,
      };
      transport.get.resolves([]);
      await fn.get(qs);
      expect(transportFactory).to.have.been.calledWith({
        baseUrl: 'http://events2:3000/',
        json: true,
      });
      expect(transport.get).to.have.been.calledWith('orders', { qs });
    });
  });
  lab.describe('POST', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the POST call', async () => {
      const body = {
        applications: [],
      };
      transport.post.resolves([]);
      await fn.post(body);
      expect(transportFactory).to.have.been.not.called;
      expect(transport.post).to.have.been.calledWith('orders', { body });
    });
  });
});
