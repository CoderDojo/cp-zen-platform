const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('Membership transport model', () => {
  const sandbox = sinon.sandbox.create();
  const transport = {
    delete: sandbox.stub(),
    post: sandbox.stub(),
  };
  const transportFactory = sandbox.stub().returns(transport);

  const fn = proxy('../../../web/lib/models/membership.js', {
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
      transport.delete.resolves([]);
      await fn.delete('1', { soft: true });
      expect(transportFactory).to.have.been.calledWith({
        baseUrl: 'http://clubs:3000/',
        json: true,
      });
      expect(transport.delete).to.have.been.calledWith('members/1', { body: { soft: true } });
    });
  });
  lab.describe('POST', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the POST call', async () => {
      transport.post.resolves([]);
      await fn.create('u1', 'd1', 'mentor');
      expect(transport.post).to.have.been.calledWith('clubs/d1/members', { body: {
        userId: 'u1',
        userType: 'mentor',
      } });
    });
  });
});
