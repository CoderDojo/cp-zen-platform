const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const languages = require('../../web/config/languages.js');
const locale = require('locale');
const _ = require('lodash');
const fn = require('../../web/lib/on-pre-auth.js');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('onPreAuth', () => {
  const server = {};
  lab.before((done) => {
    server.app = {
      availableLocales: new locale.Locales(languages.map(l => l.code), 'en_US'),
    };
    done();
  });
  lab.test('should set locale by default of en_US', (done) => {
    const reqMock = {
      app: { context: {} },
      headers: {},
    };
    const replyMock = {
      continue: sinon.stub(),
    };
    fn(server)(reqMock, replyMock);
    expect(reqMock.app.context.locality).to.equal('en_US');
    done();
  });
  lab.test('should set locale based on cookie', (done) => {
    const reqMock = {
      app: { context: {} },
      state: { NG_TRANSLATE_LANG_KEY: 'it_IT' },
      headers: {},
    };
    const replyMock = {
      continue: sinon.stub(),
    };
    fn(server)(reqMock, replyMock);
    expect(reqMock.app.context.locality).to.equal('it_IT');
    done();
  });
  lab.test('should set locale based on header', (done) => {
    const reqMock = {
      app: { context: {} },
      headers: { 'accept-language': 'fr_FR' },
    };
    const replyMock = {
      continue: sinon.stub(),
    };
    fn(server)(reqMock, replyMock);
    expect(reqMock.app.context.locality).to.equal('fr_FR');
    done();
  });
  lab.test('should pick the cookie in priority', (done) => {
    const reqMock = {
      app: { context: {} },
      state: { NG_TRANSLATE_LANG_KEY: 'de_DE' },
      headers: { 'accept-language': 'fr_FR' },
    };
    const replyMock = {
      continue: sinon.stub(),
    };
    fn(server)(reqMock, replyMock);
    expect(reqMock.app.context.locality).to.equal('de_DE');
    done();
  });
});
