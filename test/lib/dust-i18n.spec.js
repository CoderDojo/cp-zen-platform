const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxy = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('dust-i18n', () => {
  const translaterSpy = sinon.stub().returns('a');
  let fn;
  lab.before((done) => {
    fn = proxy('../../web/lib/dust-i18n', {
      './fn/i18n-translate': translaterSpy,
    });
    done();
  });
  lab.test('should get default locale', (done) => {
    const chunk = {
      write: sinon.spy(),
    };
    const context = {
      stack: { head: {} },
    };
    let bodies;
    let params;
    fn(chunk, context, bodies, params);
    expect(translaterSpy).to.have.been.calledWith('en_US');
    expect(chunk.write).to.have.been.calledWith('a');
    done();
  });

  lab.test('should get locale off context head', (done) => {
    const chunk = {
      write: sinon.spy(),
    };
    const context = {
      stack: { head: { context: { locality: 'fr_FR' } } },
    };
    let bodies;
    let params;
    fn(chunk, context, bodies, params);
    expect(translaterSpy).to.have.been.calledWith('fr_FR');
    expect(chunk.write).to.have.been.calledWith('a');
    done();
  });

  lab.test('should get locale off context stack tail\'s head', (done) => {
    const chunk = {
      write: sinon.spy(),
    };
    const context = {
      stack: { tail: { head: { context: { locality: 'jp_JP' } } } },
    };
    let bodies;
    let params;
    fn(chunk, context, bodies, params);
    expect(translaterSpy).to.have.been.calledWith('jp_JP');
    expect(chunk.write).to.have.been.calledWith('a');
    done();
  });

  lab.test('should get locale off context stack tail\'s tail\'s head', (done) => {
    const chunk = {
      write: sinon.spy(),
    };
    const context = {
      stack: { tail: { tail: { head: { context: { locality: 'de_DE' } } } } },
    };
    let bodies;
    let params;
    fn(chunk, context, bodies, params);
    expect(translaterSpy).to.have.been.calledWith('de_DE');
    expect(chunk.write).to.have.been.calledWith('a');
    done();
  });
});
