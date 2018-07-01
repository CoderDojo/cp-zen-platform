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
    put: sandbox.stub(),
  };
  const Event = {
    get: sandbox.stub(),
  };
  const Email = {
    sendAdultBooking: sandbox.stub(),
    sendDojoNotification: sandbox.stub(),
  };
  const fn = proxy('../../../web/lib/handlers/order.js', {
    '../mastermind': cbs => cbs,
    '../models/order': Order,
    '../models/event': Event,
    '../models/event-emails': Email,
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
      Order.post.resolves({ batman: true });
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
        app: {},
      };
      fn.post()[0](req, reply, () => {
        expect(Order.post).to.have.been.calledWith({
          eventId: 'event1',
          userId: 'user1',
          applications: [],
        });
        expect(reply).to.have.been.calledOnce;
        expect(reply).to.have.been.calledWith({ batman: true });
        expect(code).to.have.been.calledOnce;
        expect(code).to.have.been.calledWith(200);
        done();
      });
    });
    lab.test('it should load the event', (done) => {
      Event.get.resolves({ results: [{ id: 'event1' }] });
      req.app = {
        order: {
          eventId: 'event1',
          applications: [{ dojoId: 'dojo1' }],
        },
      };
      fn.post()[1](req, reply, () => {
        expect(Event.get).to.have.been.calledOnce;
        expect(Event.get).to.have.been.calledWith({ 'query[id]': 'event1', 'query[dojoId]': 'dojo1', related: 'sessions' });
        done();
      });
    });
    lab.test('it should load the dojo', (done) => {
      req.app = {
        event: {
          id: 'event1',
          dojoId: 'dojo1',
        },
      };
      req.seneca = {
        act: sandbox.stub().callsArg(1),
      };
      fn.post()[2](req, reply, () => {
        expect(req.seneca.act).to.have.been.calledOnce;
        expect(req.seneca.act.getCall(0).args[0]).to.be.eql({ role: 'cd-dojos', ctrl: 'dojo', cmd: 'load', id: 'dojo1' });
        done();
      });
    });
    lab.test('it should check if the requesting user is ticketing admin', (done) => {
      req.app = {
        event: {
          id: 'event1',
          dojoId: 'dojo1',
        },
      };
      req.seneca = {
        act: sandbox.stub().callsFake((params, cb) => cb(null, { allowed: true })),
      };
      fn.post()[3](req, reply, () => {
        expect(req.seneca.act).to.have.been.calledOnce;
        expect(req.seneca.act.getCall(0).args[0]).to.be.eql({ role: 'cd-events', cmd: 'is_ticketing_admin', user: { id: 'user1' }, eventInfo: { dojoId: 'dojo1' } });
        expect(req.app.isTicketingAdmin).to.be.true;
        done();
      });
    });
    lab.test('it should send a confirmation email', (done) => {
      req.app = {
        context: {
          locality: 'fr_FR',
        },
        dojo: { id: 'dojo1' },
        order: { id: 'order1' },
        event: { id: 'event1' },
        user: { id: 'user1' },
      };
      fn.post()[4](req, reply, () => {
        expect(Email.sendAdultBooking).to.have.been.calledOnce;
        expect(Email.sendAdultBooking).to.have.been.calledWith('fr_FR', { id: 'user1' }, { id: 'event1' }, { id: 'order1' }, { id: 'dojo1' });
        done();
      });
    });
    lab.test('it should send a notification email to the dojo', (done) => {
      req.app = {
        context: {
          locality: 'fr_FR',
        },
        dojo: { id: 'dojo1' },
        order: { id: 'order1' },
        event: { id: 'event1', notifyOnApplicant: true },
        user: { id: 'user1' },
        isTicketingAdmin: false,
      };
      fn.post()[5](req, reply, () => {
        expect(Email.sendDojoNotification).to.have.been.calledOnce;
        expect(Email.sendDojoNotification).to.have.been.calledWith('fr_FR', { id: 'event1', notifyOnApplicant: true }, { id: 'order1' }, { id: 'dojo1' });
        done();
      });
    });
    lab.test('it should not send a notification email when the user is ticketing admin', (done) => {
      req.app = {
        context: {
          locality: 'fr_FR',
        },
        dojo: { id: 'dojo1' },
        order: { id: 'order1' },
        event: { id: 'event1', notifyOnApplicant: true },
        user: { id: 'user1' },
        isTicketingAdmin: true,
      };
      fn.post()[5](req, reply, () => {
        expect(Email.sendDojoNotification).to.not.have.been.called;
        done();
      });
    });
    lab.test('it should not send a notification email when the option hasn\'t been ticked', (done) => {
      req.app = {
        context: {
          locality: 'fr_FR',
        },
        dojo: { id: 'dojo1' },
        order: { id: 'order1' },
        event: { id: 'event1', notifyOnApplicant: true },
        user: { id: 'user1' },
        isTicketingAdmin: true,
      };
      fn.post()[5](req, reply, () => {
        expect(Email.sendDojoNotification).to.not.have.been.called;
        done();
      });
    });
    lab.test.skip('it should call cb on error', (done) => {
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
  lab.describe('PUT', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should send the order to be saved', (done) => {
      Order.put.resolves({});
      req = {
        app: {},
        params: {
          eventId: 'event1',
          orderId: 'order1',
        },
        payload: {
          applications: [],
        },
      };
      fn.put()[0](req, reply, () => {
        expect(Order.put).to.have.been.calledWith('order1', {
          applications: [],
        });
        expect(reply).to.have.been.calledOnce;
        expect(reply).to.have.been.calledWith({});
        expect(code).to.have.been.calledOnce;
        expect(code).to.have.been.calledWith(200);
        done();
      });
    });
  });
});
