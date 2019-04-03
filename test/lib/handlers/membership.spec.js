const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('membership handler', () => {
  const sandbox = sinon.sandbox.create();
  const Memberships = {
    create: sandbox.stub(),
  };
  const MembershipRequests = {
    create: sandbox.stub(),
    load: sandbox.stub(),
    delete: sandbox.stub(),
  };
  const Dojos = {
    load: sandbox.stub(),
  };
  const Users = {
    load: sandbox.stub(),
  };
  const Notifications = {
    sendRequestToJoin: sandbox.stub(),
  };

  const fn = proxy('../../../web/lib/handlers/membership.js', {
    '../mastermind': cbs => cbs,
    '../models/membership-request': MembershipRequests,
    '../models/membership': Memberships,
    '../models/dojo': Dojos,
    '../models/user': Users,
    '../models/membership-emails': Notifications,
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
  lab.describe('POST', () => {
    const next = sandbox.stub();
    const req = {
      params: { id: 'd1' },
      payload: { userType: 'mentor' },
      user: { user: { id: 'u1' } },
      app: {
        context: {
          locality: 'fr_FR',
        }
      },
    };
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should create the membership', async () => {
      MembershipRequests.create.resolves({ id: 'm1', userType: 'mentor', dojoId: 'd1', userId: 'u1' });
      await fn.request()[0](req, reply, next); 
      expect(MembershipRequests.create).to.have.been.calledWith(
        'u1',
        'mentor',
        'd1',
      );
      expect(next).to.have.been.calledOnce;
    });
    lab.test('it should send a notification to the champion and the dojo', async () => {
      req.app.membershipRequest = { id: 'm1' };
      Dojos.load.resolves({ id: 'd1', name: 'Dojo 1', owner: { userId: 'champ1' } });
      Users.load.resolves({ id: 'champ1', name: 'User 1' });
      await fn.request()[1](req, reply); 
      expect(Dojos.load).to.have.been.calledWith(
        'd1',
        {
          fields: 'id,name,email',
          related: 'owner',
        },
      );
      expect(Users.load).to.have.been.calledWith('champ1');
      expect(Notifications.sendRequestToJoin).to.have.been.calledWith(
        'fr_FR',
        { id: 'm1', },
        { id: 'd1', name: 'Dojo 1', owner: { userId: 'champ1' } },
        { id: 'champ1', name: 'User 1' },
        { id: 'u1' },
      );
      expect(reply).to.have.been.calledOnce.and
        .calledWith({ id: 'm1' });
      expect(code).to.have.been.calledOnce.and
        .calledWith(200);
    });
  });
  lab.describe('PUT', () => {
    const next = sandbox.stub();
    const req = {
      params: { requestId: 'rq1' },
      user: { user: { id: 'u1' } },
      app: { },
    };
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should load the existing join request', async () => {
      const response = { id: 'rq1', userType: 'mentor', dojoId: 'd1', userId: 'u1' };
      MembershipRequests.load.resolves(response);
      await fn.accept()[0](req, reply, next);
      expect(MembershipRequests.load).to.have.been.calledWith('rq1');
      expect(req.app.membershipRequest).to.eql(response);
      expect(next).to.have.been.calledOnce;
    });
    lab.test('it should create the membership', async () => {
      req.app.membershipRequest = { id: 'rq1', userType: 'mentor', dojoId: 'd1', userId: 'u1' };
      Memberships.create.resolves({ id: 'm1', userTypes: ['mentor'], dojoId: 'd1', userId: 'u1' });
      await fn.accept()[1](req, reply, next);
      expect(Memberships.create).to.have.been.calledWith('u1', 'd1', 'mentor');
    });
    lab.test('it should remove the join request', async () => {
      req.app.membershipRequest = { id: 'rq1', userType: 'mentor', dojoId: 'd1', userId: 'u1' };
      MembershipRequests.delete.resolves({});
      await fn.accept()[2](req, reply, next);
      expect(MembershipRequests.delete).to.have.been.calledWith('rq1', 'u1');
    });
  });
  lab.describe('GET', () => {
    const next = sandbox.stub();
    const req = {
      params: { requestId: 'rq1' },
      user: { user: { id: 'u1' } },
    };
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should load the existing join request', async () => {
      MembershipRequests.load.resolves({ id: 'rq1' });
      await fn.loadPending()[0](req, reply, next);
      expect(MembershipRequests.load).to.have.been.calledOnce.and.calledWith('rq1');
      expect(next).to.not.have.been.called;
      expect(reply).to.have.been.calledOnce.and.calledWith({ id: 'rq1' });
    });
  });
});
