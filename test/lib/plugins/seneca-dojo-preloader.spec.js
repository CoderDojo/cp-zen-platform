const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fn = require('../../../web/lib/plugins/seneca-dojo-preloader');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('seneca-dojo-preloader', () => {
  lab.test('should search for a dojo based on urlSlug', (done) => {
    const reqMock = {
      seneca: { act: sinon.spy() },
      params: { id: 1, alpha2: 'FR' },
    };
    const expectedPreloaded = {
      title: 'Do-Joe | CoderDojo',
      description: 'Do-Joe en France',
      image: ['https://s3-eu-west-1.amazonaws.com/zen-dojo-images/1'],
      'image:width': 300,
      'image:height': 300,
    };
    const cbSpy = sinon.spy();
    fn(reqMock, cbSpy);
    reqMock.seneca.act.callArgWith(1, null,
      { id: 1, alpha2: 'FR', name: 'Do-Joe', countryName: 'France' });
    expect(reqMock.seneca.act).to.have.been.calledWith({ role: 'cd-dojos',
      cmd: 'find',
      query: {
        urlSlug: '1/FR',
      } },
    sinon.match.func);
    expect(cbSpy).to.have.been.calledWith(null, expectedPreloaded);
    done();
  });
  lab.test('should skip if no dojo found', (done) => {
    const reqMock = {
      seneca: { act: sinon.spy() },
      params: { id: 1, alpha2: 'FR' },
    };
    const cbSpy = sinon.spy();
    fn(reqMock, cbSpy);
    reqMock.seneca.act.callArgWith(1, 'err', null);
    expect(reqMock.seneca.act).to.have.been.calledWith({ role: 'cd-dojos',
      cmd: 'find',
      query: {
        urlSlug: '1/FR',
      } },
    sinon.match.func);
    expect(cbSpy).to.have.been.calledOnce;
    expect(cbSpy).to.have.been.calledWith('err');
    done();
  });
});
