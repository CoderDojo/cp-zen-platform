const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fn = require('../../../web/lib/plugins/seneca-event-preloader');
const moment = require('moment');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
// NOTE : if those test fails, you may be missing translations
lab.experiment('seneca-event-preloader', () => {
  let yesterday;
  let tomorrow;
  lab.before((done) => {
    yesterday = moment.utc().set('hours', 0).set('minutes', 0);
    tomorrow = moment.utc().add(1, 'day');
    done();
  });

  lab.test('should use next event date', (done) => {
    const formattedStartTime = tomorrow.format('YYYY/MM/DD');
    const reqMock = {
      seneca: { act: sinon.stub() },
      params: { eventId: 1 },
    };
    const expectedPreloaded = {
      title: 'Do-Joe | CoderDojo',
      description: `Event1 à Do-Joe, le ${formattedStartTime}`,
      image: ['https://s3-eu-west-1.amazonaws.com/zen-dojo-images/42'],
      'image:width': 300,
      'image:height': 300,
    };
    const cbSpy = sinon.spy();
    reqMock.seneca.act
      .onCall(0)
      .callsArgWith(1, null,
        { id: 1,
          name: 'Event1',
          dojoId: 42,
          dates: [{ startTime: yesterday.format('YYYY-MM-DDTHH:mm:ssZ'),
            endTime: yesterday.format('YYYY-MM-DDTHH:mm:ssZ') },
          { startTime: tomorrow.format('YYYY-MM-DDTHH:mm:ssZ'),
            endTime: tomorrow.format('YYYY-MM-DDTHH:mm:ssZ') }] });
    reqMock.seneca.act
      .onCall(1)
      .callsArgWith(1, null,
        { id: 42, alpha2: 'FR', name: 'Do-Joe', countryName: 'France' });
    fn(reqMock, cbSpy);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-events', cmd: 'getEvent', id: 1 }, sinon.match.func);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-dojos', cmd: 'load', id: 42 }, sinon.match.func);
    expect(cbSpy).to.have.been.calledWith(null, expectedPreloaded);
    done();
  });

  lab.test('should search for an event based on params/Id', (done) => {
    const formattedStartTime = tomorrow.format('YYYY/MM/DD');
    const reqMock = {
      seneca: { act: sinon.stub() },
      params: { eventId: 1 },
    };
    const expectedPreloaded = {
      title: 'Do-Joe | CoderDojo',
      description: `Event1 à Do-Joe, le ${formattedStartTime}`,
      image: ['https://s3-eu-west-1.amazonaws.com/zen-dojo-images/42'],
      'image:width': 300,
      'image:height': 300,
    };
    const cbSpy = sinon.spy();
    reqMock.seneca.act
      .onCall(0)
      .callsArgWith(1, null,
        { id: 1,
          name: 'Event1',
          dojoId: 42,
          dates: [{ startTime: tomorrow.format('YYYY-MM-DDTHH:mm:ssZ'),
            endTime: tomorrow.format('YYYY-MM-DDTHH:mm:ssZ') }] });
    reqMock.seneca.act
      .onCall(1)
      .callsArgWith(1, null,
        { id: 42, alpha2: 'FR', name: 'Do-Joe', countryName: 'France' });
    fn(reqMock, cbSpy);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-events', cmd: 'getEvent', id: 1 }, sinon.match.func);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-dojos', cmd: 'load', id: 42 }, sinon.match.func);
    expect(cbSpy).to.have.been.calledWith(null, expectedPreloaded);
    done();
  });
  lab.test('should not return anything if dojo data is not found', (done) => {
    const reqMock = {
      seneca: { act: sinon.stub() },
      params: { eventId: 1 },
    };
    const cbSpy = sinon.spy();
    reqMock.seneca.act
      .onCall(0)
      .callsArgWith(1, null,
        { id: 1,
          name: 'Event1',
          dojoId: 42,
          dates: [{ startTime: tomorrow.format('YYYY-MM-DDTHH:mm:ssZ'),
            endTime: tomorrow.format('YYYY-MM-DDTHH:mm:ssZ') }] });
    reqMock.seneca.act
      .onCall(1)
      .callsArgWith(1, 'err', null);
    fn(reqMock, cbSpy);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-events', cmd: 'getEvent', id: 1 }, sinon.match.func);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-dojos', cmd: 'load', id: 42 }, sinon.match.func);
    expect(cbSpy).to.have.been.calledOnce;
    expect(cbSpy).to.have.been.calledWith('err');
    done();
  });
  lab.test('should not return anything if event data is not found', (done) => {
    const reqMock = {
      seneca: { act: sinon.stub() },
      params: { eventId: 1 },
    };
    const cbSpy = sinon.spy();
    reqMock.seneca.act
      .onCall(0)
      .callsArgWith(1, 'err', null);
    fn(reqMock, cbSpy);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-events', cmd: 'getEvent', id: 1 }, sinon.match.func);
    expect(cbSpy).to.have.been.calledOnce;
    expect(cbSpy).to.have.been.calledWith('err');
    done();
  });
});
