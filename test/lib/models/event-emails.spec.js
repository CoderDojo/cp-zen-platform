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

  const fn = proxy('../../../web/lib/models/event-emails.js', {
    '../transports/http': transportFactory,
  });
  lab.afterEach((done) => {
    sandbox.reset();
    sandbox.restore();
    done();
  });
  lab.describe('formatEventTime', () => {
    lab.test('should return a HH:mm', (done) => {
      expect(fn.formatEventTime({ startTime: '2018-01-01T16:50:00', endTime: '2018-01-01T18:00:00' })).to.equal('16:50 - 18:00');
      done();
    });
  });
  lab.describe('formatEventDate', () => {
    lab.test('should return Do MMMM YY for one-off event', (done) => {
      expect(fn.formatEventDate({ type: 'one-off', dates: [{ startTime: '2018-01-01T01:00:00', endTime: '2018-01-01T02:00:00' }] })).to.equal('1st January 18');
      done();
    });
    lab.test('should return Do MMMM YY for recurring event', (done) => {
      expect(fn.formatEventDate({
        type: 'recurring',
        dates: [
          { startTime: '2018-01-01T01:00:00', endTime: '2018-01-01T02:00:00' },
          { startTime: '2018-01-08T01:00:00', endTime: '2018-01-08T02:00:00' },
        ] })).to.equal('1st January 18 - 8th January 18');
      done();
    });
  });
  lab.describe('sendAdultBooking', () => {
    lab.test('it should post the email with the right template', (done) => {
      const spy = sandbox.spy(fn, 'post');
      fn.formatEventDate = sandbox.stub();
      fn.formatEventTime = sandbox.stub();
      fn.sendAdultBooking('fr_FR', { id: 'user1' }, { id: 'event1', dates: [] }, { id: 'order1' }, { id: 'dojo1' });
      expect(spy).to.have.been.calledOnce;
      expect(fn.formatEventDate).to.have.been.calledOnce;
      expect(fn.formatEventTime).to.have.been.calledOnce;
      expect(spy.getCall(0).args[0].templateName).to.be.equal('booking-confirmed');
      done();
    });
  });
  lab.describe('sendDojoNotification', () => {
    lab.test('it should post the dojo email with the approved template', (done) => {
      const spy = sandbox.spy(fn, 'post');
      fn.formatEventDate = sandbox.stub();
      fn.formatEventTime = sandbox.stub();
      fn.sendDojoNotification('fr_FR',
        { id: 'event1', dates: [], sessions: [{ id: 'session1', name: 'session1Name' }] },
        { id: 'order1', applications: [{ sessionId: 'session1' }] },
        { id: 'dojo1' },
      );
      expect(spy).to.have.been.calledOnce;
      expect(fn.formatEventDate).to.have.been.calledOnce;
      expect(spy.getCall(0).args[0].templateName).to.be.equal('ticket-application-approved-to-dojo');
      done();
    });
    lab.test('it should post the dojo email with the requesting approval template', (done) => {
      const spy = sandbox.spy(fn, 'post');
      fn.formatEventDate = sandbox.stub();
      fn.formatEventTime = sandbox.stub();
      fn.sendDojoNotification('fr_FR',
        { id: 'event1', dates: [], sessions: [{ id: 'session1', name: 'session1Name' }], ticketApproval: true },
        { id: 'order1', applications: [{ sessionId: 'session1' }] },
        { id: 'dojo1' },
      );
      expect(spy).to.have.been.calledOnce;
      expect(fn.formatEventDate).to.have.been.calledOnce;
      expect(spy.getCall(0).args[0].templateName).to.be.equal('ticket-application-received-to-dojo');
      done();
    });
  });
});
