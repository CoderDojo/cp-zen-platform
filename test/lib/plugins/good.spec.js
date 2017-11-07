const chai = require('chai');
const sinon = require('sinon');
const lab = require('lab').script();
const fn = require('../../../web/lib/plugins/good');

const expect = chai.expect;
exports.lab = lab;
lab.describe('good', () => {
  lab.test('should set up local logging', (done) => {
    process.env.HAPI_DEBUG = 'true';
    const serverMock = {
      register: sinon.spy(),
      app: {
        hostUid: '',
      },
      log: sinon.stub(),
    };
    const cbSpy = sinon.spy();
    fn.register(serverMock, null, cbSpy);
    serverMock.register.callArg(1);
    expect(serverMock.register.getCall(0).args[0].options.reporters.length)
      .to.equal(1);
    // This test won't pass when not in Docker.
    expect(serverMock.register.getCall(0).args[0].options.reporters[0].config)
      .to.equal('/tmp/hapi-zen-platform.log');
    done();
  });
  lab.test('should setup remote logging', (done) => {
    process.env.HAPI_DEBUG = 'false';
    process.env.LOGENTRIES_ENABLED = 'true';
    process.env.LOGENTRIES_TOKEN = 'gloubiboulga';
    const serverMock = {
      register: sinon.spy(),
      app: {
        hostUid: '',
      },
      log: sinon.stub(),
    };
    const cbSpy = sinon.spy();
    fn.register(serverMock, null, cbSpy);
    serverMock.register.callArg(1);
    expect(serverMock.register.getCall(0).args[0].options.reporters.length)
      .to.equal(1);
    // This test won't pass when not in Docker.
    expect(serverMock.register.getCall(0).args[0].options.reporters[0].config.endpoint)
      .to.equal('https://webhook.logentries.com/noformat/logs/gloubiboulga');
    done();
  });
});
