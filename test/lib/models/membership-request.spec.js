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
});
