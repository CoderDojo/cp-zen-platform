const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fn = require('../../web/lib/dust-load-open-graph');


const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('dust-load-open-graph', () => {
  lab.test('should apply single opengraph tags based on context', (done) => {
    const chunk = {
      write: sinon.spy(),
    };
    const context = {
      stack: { head: { context: { preload: { title: 'a' } } } },
    };
    fn(chunk, context);
    expect(chunk.write).to.have.been.calledWith('<meta property="og:title" content="a"/>');
    done();
  });
  lab.test('should apply multiple same opengraph tag based on context', (done) => {
    const chunk = {
      write: sinon.spy(),
    };
    const context = {
      stack: { head: { context: { preload: { title: ['a', 'b'] } } } },
    };
    fn(chunk, context);
    expect(chunk.write).to.have.been.calledWith('<meta property="og:title" content="a"/><meta property="og:title" content="b"/>');
    done();
  });
  lab.test('should leave the chunk untouched if no context', (done) => {
    const chunk = {
      write: sinon.spy(),
    };
    const context = {
      stack: { head: { context: {} } },
    };
    fn(chunk, context);
    expect(chunk.write).to.have.been.calledWith('');
    done();
  });
});
