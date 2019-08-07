const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('Membership email handler', () => {
  const sandbox = sinon.sandbox.create();
  const transport = {
    post: sandbox.stub(),
  };
  const transportFactory = sandbox.stub().returns(transport);

  const fn = proxy('../../../web/lib/models/membership-emails.js', {
    '../transports/http': transportFactory,
  });
  lab.afterEach(done => {
    sandbox.reset();
    sandbox.restore();
    done();
  });
  lab.describe('sendRequestToJoin', () => {
    lab.test('it should post the email with the right template', done => {
      const spy = sandbox.spy(fn, 'post');
      fn.sendRequestToJoin(
        'fr_FR',
        { id: 'membership1', userType: 'mentor' },
        { id: 'dojo1', email: 'dojo@example.com', name: 'Dojo 1' },
        { id: 'champion1', email: 'champion@example.com' },
        { id: 'user1', email: 'user@example.com', name: 'User 1' }
      );
      expect(spy).to.have.been.calledOnce;
      expect(spy.getCall(0).args[0].templateName).to.be.equal(
        'user-request-to-join'
      );
      expect(spy.getCall(0).args[0].templateOptions).to.eql({
        dojoName: 'Dojo 1',
        userType: 'mentor',
        name: 'User 1',
        email: 'user@example.com',
        acceptLink:
          'http://localhost:8000/dashboard/dojos/dojo1/join-requests/membership1/status/accept',
        refuseLink:
          'http://localhost:8000/dashboard/dojos/dojo1/join-requests/membership1/status/refuse',
        year: new Date().getFullYear(),
      });
      expect(spy.getCall(0).args[0].emailOptions).to.eql({
        to: 'champion@example.com, dojo@example.com',
        from: '"Dojo 1" <info@coderdojo.org>',
      });
      done();
    });
  });
});
