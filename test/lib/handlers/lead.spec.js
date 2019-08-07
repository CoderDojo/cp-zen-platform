const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('lead handler', () => {
  const sandbox = sinon.sandbox.create();
  const Lead = {
    list: sandbox.stub(),
  };
  const fn = proxy('../../../web/lib/handlers/lead.js', {
    '../mastermind': cbs => cbs,
    '../models/lead': Lead,
  });
  const reply = sandbox.stub();
  const code = sandbox.stub();
  lab.beforeEach(done => {
    reply.returns({
      code,
    });
    done();
  });
  lab.afterEach(done => {
    sandbox.reset();
    done();
  });
  lab.describe('GET', () => {
    const user = { id: 'user1' };
    const req = {
      query: { userId: 'user1' },
      user,
    };
    lab.afterEach(done => {
      sandbox.reset();
      done();
    });
    lab.test('it should return the leads', async () => {
      Lead.list.resolves([]);
      await fn.list()[0](req, reply);
      expect(Lead.list).to.have.been.calledWith({
        userId: 'user1',
      });
      expect(reply).to.have.been.calledOnce;
      expect(reply).to.have.been.calledWith([]);
      expect(code).to.have.been.calledOnce;
      expect(code).to.have.been.calledWith(200);
    });
  });
});
