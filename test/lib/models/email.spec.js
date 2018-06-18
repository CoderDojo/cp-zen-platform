const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('email handler', () => {
  const sandbox = sinon.sandbox.create();
  const transport = {
    post: sandbox.stub(),
  };
  const transportFactory = sandbox.stub().returns(transport);

  const Class = proxy('../../../web/lib/models/email.js', {
    '../transports/http': transportFactory,
  });
  const fn = new Class();
  lab.afterEach((done) => {
    sandbox.reset();
    done();
  });
  lab.describe('POST', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should proxy the POST call', async () => {
      const body = { to: 'banana@example.com' };
      transport.post.resolves([]);
      await fn.post(body);
      expect(transportFactory).to.have.been.calledWith({
        baseUrl: 'http://email:3000/',
        json: true,
      });
      expect(transport.post).to.have.been.calledWith('email/send', { body });
    });
  });
  lab.describe('formatTime', () => {
    lab.test('should return a HH:mm', (done) => {
      expect(fn.formatTime('2018-01-01T16:50:00')).to.equal('16:50');
      done();
    });
  });
  lab.describe('formatDate', () => {
    lab.test('should return Do MMMM YY', (done) => {
      expect(fn.formatDate('2018-01-01T16:50:00', 'fr_FR')).to.equal('1er janvier 18');
      done();
    });
  });
});
