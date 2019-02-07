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
    load: sandbox.stub(),
    delete: sandbox.stub(),
  };
  const transportFactory = sandbox.stub().returns(transport);

  const fn = proxy('../../../web/lib/models/application.js', {
    '../transports/http': transportFactory,
  });
  lab.afterEach((done) => {
    sandbox.reset();
    done();
  });
  lab.describe('DELETE', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the DELETE call', async () => {
      const payload = {
        soft: true,
      };
      const uid = 1;
      transport.delete.resolves([]);
      await fn.forUser.delete(uid, payload);
      expect(transportFactory).to.have.been.calledWith({
        baseUrl: 'http://events2:3000/',
        json: true,
      });
      expect(transport.delete).to.have.been.calledWith('users/1/applications', { body: { soft: true } });
    });
  });
});
