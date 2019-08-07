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

  const fn = proxy('../../../web/lib/models/user.js', {
    '../transports/http': transportFactory,
  });
  lab.afterEach(done => {
    sandbox.reset();
    done();
  });
  lab.describe('GET: search', () => {
    lab.afterEach(done => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the GET call', async () => {
      const qs = {
        email: 'banana@example.com',
      };
      transport.get.resolves({ results: [], total: 0 });
      const res = await fn.search(qs);
      expect(transportFactory).to.have.been.calledWith({
        baseUrl: 'http://users:3000/',
        json: true,
      });
      expect(transport.get).to.have.been.calledWith('users', { qs });
      expect(res).to.eql({ results: [], total: 0 });
    });
  });
  lab.describe('GET: load', () => {
    lab.afterEach(done => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the GET call', async () => {
      const qs = {
        related: '[profile]',
      };
      const uid = 1;
      transport.get.resolves([]);
      await fn.load(uid, qs);
      expect(transport.get).to.have.been.calledWith('users/1', { qs });
    });
  });
  lab.describe('DELETE', () => {
    lab.afterEach(done => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the DELETE call', async () => {
      const payload = {
        soft: true,
      };
      const uid = 1;
      transport.delete.resolves([]);
      await fn.delete(uid, payload);
      expect(transport.delete).to.have.been.calledWith('users/1', {
        body: { soft: true },
      });
    });
  });
});
