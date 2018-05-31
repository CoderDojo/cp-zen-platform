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
    load: sandbox.stub(),
  };
  const fn = proxy('../../../web/lib/handlers/event.js', {
    '../mastermind': cbs => cbs,
    '../models/event': Event,
  });
  const reply = sandbox.stub();
  const code = sandbox.stub();
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
    const user = { id: 'user1' };
    const req = {
      params: { dojoId: 1 },
      query: { 'query[status]': 'published' },
      user,
    };
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should return the events', (done) => {
      Event.get.resolves([]);
      fn.get()[0](req, reply, () => {
        expect(Event.get).to.have.been.calledWith({
          'query[dojoId]': 1,
          'query[status]': 'published',
        });
        expect(reply).to.have.been.calledOnce;
        expect(reply).to.have.been.calledWith([]);
        expect(code).to.have.been.calledOnce;
        expect(code).to.have.been.calledWith(200);
        done();
      });
    });
    lab.test('it should call cb on error', (done) => {
      const err = new Error('fake err');
      Event.get.rejects(err);
      fn.get()[0](req, reply, (_err) => {
        expect(Event.get).to.have.been.calledWith({
          'query[dojoId]': 1,
          'query[status]': 'published',
        });
        expect(_err.message).to.equal('fake err');
        // reply will be called by mastermind, in a boomified manner
        expect(reply).to.not.have.been.called;
        done();
      });
    });
  });
  lab.describe('GET /:eventId', () => {
    const user = { id: 'user1' };
    const req = {
      params: { eventId: 1 },
      query: { },
      user,
    };
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should return the event', (done) => {
      Event.load.resolves({});
      fn.load()[0](req, reply, () => {
        expect(Event.load).to.have.been.calledWith(1, {}); 
        expect(reply).to.have.been.calledOnce;
        expect(reply).to.have.been.calledWith({});
        expect(code).to.have.been.calledOnce;
        expect(code).to.have.been.calledWith(200);
        done();
      });
    });
  });
});
