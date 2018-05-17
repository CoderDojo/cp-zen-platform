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
  const Order = {
    get: sandbox.stub(),
    post: sandbox.stub(),
  };
  const fn = proxy('../../../web/lib/handlers/order.js', {
    '../mastermind': cbs => cbs,
    '../models/order': Order,
  });
  const reply = sandbox.stub();
  const code = sandbox.stub();
  let req = {};
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
    lab.test('it should return the orders', (done) => {
      Order.get.resolves([]);
      req = {
        params: {
          userId: 'user1',
        },
        query: {
          'query[eventId]': 'event1',
        },
      };
      fn.get()[0](req, reply, () => {
        expect(Order.get).to.have.been.calledWith({
          'query[eventId]': 'event1',
          'query[userId]': 'user1',
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
      req = {
        params: {
          userId: 'user1',
        },
        query: {
          'query[eventId]': 'event1',
        },
      };
      Order.get.rejects(err);
      fn.get()[0](req, reply, (_err) => {
        expect(Order.get).to.have.been.calledWith({
          'query[eventId]': 'event1',
          'query[userId]': 'user1',
        });
        expect(_err.message).to.equal('fake err');
        // reply will be called by mastermind, in a boomified manner
        expect(reply).to.not.have.been.called;
        done();
      });
    });
  });
  lab.describe('POST', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should send the order to be saved', (done) => {
      Order.post.resolves({});
      req = {
        user: {
          user: {
            id: 'user1',
          },
        },
        params: {
          eventId: 'event1',
        },
        payload: {
          applications: [],
        },
      };
      fn.post()[0](req, reply, () => {
        expect(Order.post).to.have.been.calledWith({
          eventId: 'event1',
          userId: 'user1',
          applications: [],
        });
        expect(reply).to.have.been.calledOnce;
        expect(reply).to.have.been.calledWith({});
        expect(code).to.have.been.calledOnce;
        expect(code).to.have.been.calledWith(200);
        done();
      });
    });
    lab.test('it should call cb on error', (done) => {
      const err = new Error('fake err');
      req = {
        user: {
          user: {
            id: 'user1',
          },
        },
        params: {
          eventId: 'event1',
        },
        payload: {
          applications: [],
        },
      };
      Order.post.rejects(err);
      fn.post()[0](req, reply, (_err) => {
        expect(Order.post).to.have.been.calledWith({
          eventId: 'event1',
          userId: 'user1',
          applications: [],
        });
        expect(_err.message).to.equal('fake err');
        // reply will be called by mastermind, in a boomified manner
        expect(reply).to.not.have.been.called;
        done();
      });
    });
  });
});
