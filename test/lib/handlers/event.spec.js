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
  const Event = {
    get: sandbox.stub(),
  };
  const fn = proxy('../../../web/lib/handlers/event.js', {
    '../mastermind': cbs => cbs,
    '../models/event': Event,
  });
  const user = { id: 'user1' };
  const req = {
    params: { dojoId: 1 },
    query: { 'query[status]': 'published' },
    user,
  };
  const reply = sandbox.stub();
  const code = sandbox.stub();
  const cb = sandbox.stub();
  lab.beforeEach((done) => {
    reply.returns({
      code,
    });
    done();
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
    lab.test('it should return the events', async () => {
      Event.get.resolves([]);
      await fn.get()[0](req, reply, cb);
      expect(Event.get).to.have.been.calledWith({
        'query[dojoId]': 1,
        'query[status]': 'published',
      });
      expect(reply).to.have.been.calledOnce;
      expect(reply).to.have.been.calledWith([]);
      expect(code).to.have.been.calledOnce;
      expect(code).to.have.been.calledWith(200);
    });
    lab.test('it should call cb on error', async () => {
      const err = new Error('fake err');
      Event.get.rejects(err);
      try {
        await fn.get()[0](req, reply, cb);
      } catch (_err) {
        expect(Event.get).to.have.been.calledWith({
          'query[dojoId]': 1,
          'query[status]': 'published',
        });
        expect(_err.message).to.equal('fake err');
        // reply will be called by mastermind, in a boomified manner
        expect(reply).to.not.have.been.called;
      }
    });
  });
});
