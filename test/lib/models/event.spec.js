const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('event handler', () => {
  const sandbox = sinon.sandbox.create();
  const transport = {
    get: sandbox.stub(),
  };
  const transportFactory = sandbox.stub().returns(transport);

  const fn = proxy('../../../web/lib/models/event.js', {
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
        'query[dojoId]': 1,
        'query[status]': 'published',
      };
      transport.get.resolves([]);
      await fn.get(qs);
      expect(transportFactory).to.have.been.calledWith({
        baseUrl: 'http://events2:3000/',
        json: true,
      });
      expect(transport.get).to.have.been.calledWith('events', { qs });
    });
  });
  lab.describe('GET /:eventId', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the GET call', async () => {
      const qs = {};
      const id = '1234-5678';
      transport.get.resolves({});
      await fn.load(id, qs);
      expect(transport.get).to.have.been.calledWith('events/1234-5678', { qs });
    });
  });
});
