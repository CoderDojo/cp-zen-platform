const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('user handler', () => {
  const sandbox = sinon.sandbox.create();
  const User = {
    search: sandbox.stub(),
    load: sandbox.stub(),
    delete: sandbox.stub(),
  };
  const Application = {
    forUser: {
      delete: sandbox.stub(),
    },
  };
  const Membership = {
    delete: sandbox.stub(),
  };
  const fn = proxy('../../../web/lib/handlers/user.js', {
    '../mastermind': cbs => cbs,
    '../models/user': User,
    '../models/application': Application,
    '../models/membership': Membership,
  });
  const reply = sandbox.stub();
  const code = sandbox.stub();
  const next = sandbox.stub();
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
  lab.describe('GET: search', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should return the user', async () => {
      User.search.resolves({ results: [{ id: 1 }], total: 1 });
      req = {
        query: {
          email: 'banana@example.com',
          related: 'profile',
        },
      };
      await fn.search()[0](req, reply);
      expect(User.search).to.have.been.calledWith({
        email: 'banana@example.com',
        related: '[profile]',
      });
      expect(reply).to.have.been.calledOnce.and.calledWith({ results: [{ id: 1 }], total: 1 });
      expect(code).to.have.been.calledOnce.and.calledWith(200);
    });
    lab.test('it should call cb on error', async () => {
      const err = new Error('fake err');
      req = {
        query: {
          email: 'banana@example.com',
          related: 'profile',
        },
      };
      User.search.rejects(err);
      try {
        await fn.search()[0](req, reply);
      } catch (e) {
        expect(User.search).to.have.been.calledWith({
          email: 'banana@example.com',
          related: '[profile]',
        });
        expect(e.message).to.equal('fake err');
        // reply will be called by mastermind, in a boomified manner
        expect(reply).to.not.have.been.called;
      }
    });
  });

  lab.describe('GET: load', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should return the user', async () => {
      User.load.resolves({ id: 1 });
      req = {
        params: {
          userId: 1,
        },
        query: {
          related: 'profile',
        },
      };
      await fn.load()[0](req, reply);
      expect(User.load).to.have.been.calledWith(1, { related: '[profile]' });
      expect(reply).to.have.been.calledOnce.and.calledWith({ id: 1 });
      expect(code).to.have.been.calledOnce.and.calledWith(200);
    });
    lab.test('it should call cb on error', async () => {
      const err = new Error('fake err');
      req = {
        params: {
          userId: 1,
        },
        query: {
          related: 'profile',
        },
      };
      User.load.rejects(err);
      try {
        await fn.load()[0](req, reply);
      } catch (e) {
        expect(User.load).to.have.been.calledWith(1, { related: '[profile]' });
        expect(e.message).to.equal('fake err');
        // reply will be called by mastermind, in a boomified manner
        expect(reply).to.not.have.been.called;
      }
    });
  });
  lab.describe('DELETE', () => {
    lab.afterEach((done) => {
      sandbox.reset();
      done();
    });
    lab.test('it should delete the user', async () => {
      User.load.resolves({ id: 1 });
      req = {
        params: {
          userId: 1,
        },
        payload: {},
        app: {},
      };
      await fn.delete()[0](req, reply, next);
      expect(User.load).to.have.been.calledWith(1, { related: '[profile, children]' });
      expect(User.delete).to.have.been.calledWith(1, {});
      expect(next).to.have.been.calledOnce.and.calledWith();
      expect(req.app.users).to.eql([1]);
    });
    lab.test('it should delete the applications', async () => {
      Application.forUser.delete.resolves();
      req.app = {
        users: [1, 3],
      };
      req.payload = {
        soft: false,
      };
      await fn.delete()[1](req, reply, next);
      expect(next).to.have.been.calledOnce.and.calledWith();
      expect(Application.forUser.delete).to.have.been.calledTwice;
      expect(Application.forUser.delete.getCall(0)).to.have.been.calledWith(1, { soft: false });
      expect(Application.forUser.delete.getCall(1)).to.have.been.calledWith(3, { soft: false });
    });
    lab.test('it should ignore 404 when deleting the applications', async () => {
      const err = new Error();
      err.statusCode = 404;
      Application.forUser.delete.rejects(err);
      req.app = {
        users: [1, 3],
      };
      req.payload = {
        soft: false,
      };
      await fn.delete()[1](req, reply, next);
      expect(next).to.have.been.called.and.calledWith();
      expect(Application.forUser.delete).to.have.been.calledTwice;
      expect(Application.forUser.delete.getCall(0)).to.have.been.calledWith(1, { soft: false });
      expect(Application.forUser.delete.getCall(1)).to.have.been.calledWith(3, { soft: false });
    });

    lab.test('it should delete the memberships', async () => {
      Membership.delete.resolves();
      req.app = {
        users: [1, 3],
      };
      req.payload = {
        soft: false,
      };
      await fn.delete()[2](req, reply, next);
      expect(next).to.not.have.been.called;
      expect(code).to.have.been.calledWith(204);
      expect(Membership.delete).to.have.been.calledTwice;
      expect(Membership.delete.getCall(0)).to.have.been.calledWith(1, { soft: false });
      expect(Membership.delete.getCall(1)).to.have.been.calledWith(3, { soft: false });
    });
    lab.test('it should ignore 404 when deleting the memberships', async () => {
      const err = new Error();
      err.statusCode = 404;
      Membership.delete.rejects(err);
      req.app = {
        users: [1, 3],
      };
      req.payload = {
        soft: false,
      };
      await fn.delete()[2](req, reply, next);
      expect(next).to.not.have.been.called;
      expect(code).to.have.been.calledWith(204);
      expect(Membership.delete).to.have.been.calledTwice;
      expect(Membership.delete.getCall(0)).to.have.been.calledWith(1, { soft: false });
      expect(Membership.delete.getCall(1)).to.have.been.calledWith(3, { soft: false });
    });
  });
});
