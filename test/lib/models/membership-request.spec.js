const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('Membership-request transport model', () => {
  const sandbox = sinon.sandbox.create();
  const transport = {
    post: sandbox.stub(),
    get: sandbox.stub(),
    delete: sandbox.stub(),
  };
  const transportFactory = sandbox.stub().returns(transport);

  const fn = proxy('../../../web/lib/models/membership-request.js', {
    '../transports/http': transportFactory,
  });
  lab.afterEach((done) => {
    sandbox.reset();
    done();
  });
  lab.describe('create', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the POST call', async () => {
      transport.post.resolves([]);
      await fn.create('1', 'mentor', 'd1');
      expect(transportFactory).to.have.been.calledWith({
        baseUrl: 'http://users:3000/',
        json: true,
      });
      expect(transport.post).to.have.been.calledWith('/users/1/join_requests', { 
        body: {
          userType: 'mentor',
          dojoId: 'd1',
        },
      });
    });
  });
  lab.describe('load', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the GET call', async () => {
      transport.get.resolves({});
      await fn.load('1');
      expect(transport.get).to.have.been.calledWith('/join_requests/1');
    });
  });
  lab.describe('delete', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the DELETE call', async () => {
      transport.delete.resolves({});
      await fn.delete('r1','u1');
      expect(transport.delete).to.have.been.calledWith('/users/u1/join_requests/r1');
    });
  });

});
