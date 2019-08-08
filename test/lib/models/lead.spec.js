const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('lead handler', () => {
  const sandbox = sinon.sandbox.create();
  const transport = {
    get: sandbox.stub(),
  };
  const transportFactory = sandbox.stub().returns(transport);

  const fn = proxy('../../../web/lib/models/lead.js', {
    '../transports/http': transportFactory,
  });
  lab.afterEach(done => {
    sandbox.reset();
    done();
  });
  lab.describe('GET', () => {
    lab.afterEach(done => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the GET call', async () => {
      const qs = {
        userId: 1,
      };
      transport.get.resolves([]);
      await fn.list(qs);
      expect(transportFactory).to.have.been.calledWith({
        baseUrl: 'http://clubs:3000/',
        json: true,
      });
      expect(transport.get).to.have.been.calledWith('leads', { qs });
    });
  });
});
