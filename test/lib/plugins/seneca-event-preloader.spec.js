const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const moment = require('moment');
const fn = require('../../../web/lib/plugins/seneca-event-preloader');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
// NOTE : if those test fails, you may be missing translations
lab.describe('seneca-event-preloader', () => {
  lab.test('should use next event date', (done) => {
    // If you work past 23pm, blame yourself for the test not passing
    const startTime = moment.utc();
    startTime.set('hour', 22).subtract('1', 'day');
    const endTime = moment.utc();
    endTime.set('hour', 23).subtract('1', 'day');
    const startTime2 = moment.utc();
    startTime2.set('hour', 22);
    const endTime2 = moment.utc();
    endTime2.set('hour', 23);

    const formattedStartTime = startTime2.format('YYYY/MM/DD');
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
          dates: [{ startTime: startTime.format('YYYY-MM-DDTH:mm:ssZ'),
            endTime: endTime.format('YYYY-MM-DDTH:mm:ssZ') },
          { startTime: startTime2.format('YYYY-MM-DDTH:mm:ssZ'),
            endTime: endTime2.format('YYYY-MM-DDTH:mm:ssZ') }] });
    reqMock.seneca.act
      .onCall(1)
      .callsArgWith(1, null,
        { id: 42, alpha2: 'FR', name: 'Do-Joe', countryName: 'France' });
    fn(reqMock, cbSpy);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-events', cmd: 'getEvent', id: 1 }, sinon.match.func);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-dojos', cmd: 'load', id: 42 }, sinon.match.func);
    expect(cbSpy).to.have.been.calledWith(expectedPreloaded);
    done();
  });
  lab.test('should search for an event based on params/Id', (done) => {
    // If you work past 23pm, blame yourself for the test not passing
    const startTime = moment.utc();
    startTime.set('hour', 22);
    const endTime = moment.utc();
    endTime.set('hour', 23);
    const formattedStartTime = startTime.format('YYYY/MM/DD');
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
          dates: [{ startTime: startTime.format('YYYY-MM-DDTH:mm:ssZ'),
            endTime: endTime.format('YYYY-MM-DDTH:mm:ssZ') }] });
    reqMock.seneca.act
      .onCall(1)
      .callsArgWith(1, null,
        { id: 42, alpha2: 'FR', name: 'Do-Joe', countryName: 'France' });
    fn(reqMock, cbSpy);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-events', cmd: 'getEvent', id: 1 }, sinon.match.func);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-dojos', cmd: 'load', id: 42 }, sinon.match.func);
    expect(cbSpy).to.have.been.calledWith(expectedPreloaded);
    done();
  });
  lab.test('should not return anything if dojo data is not found', (done) => {
    // If you work past 23pm, blame yourself for the test not passing
    const startTime = moment.utc();
    startTime.set('hour', 22);
    const endTime = moment.utc();
    endTime.set('hour', 23);
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
          dates: [{ startTime: startTime.format('YYYY-MM-DDTH:mm:ssZ'),
            endTime: endTime.format('YYYY-MM-DDTH:mm:ssZ') }] });
    reqMock.seneca.act
      .onCall(1)
      .callsArgWith(1, null, null);
    fn(reqMock, cbSpy);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-events', cmd: 'getEvent', id: 1 }, sinon.match.func);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-dojos', cmd: 'load', id: 42 }, sinon.match.func);
    expect(cbSpy).to.have.been.calledOnce;
    expect(cbSpy.getCall(0).args.length).to.equal(0);
    done();
  });
  lab.test('should not return anything if event data is not found', (done) => {
    // If you work past 23pm, blame yourself for the test not passing
    const reqMock = {
      seneca: { act: sinon.stub() },
      params: { eventId: 1 },
    };
    const cbSpy = sinon.spy();
    reqMock.seneca.act
      .onCall(0)
      .callsArgWith(1, null, null);
    fn(reqMock, cbSpy);
    expect(reqMock.seneca.act).to.have.been
      .calledWith({ role: 'cd-events', cmd: 'getEvent', id: 1 }, sinon.match.func);
    expect(cbSpy).to.have.been.calledOnce;
    expect(cbSpy.getCall(0).args.length).to.equal(0);
    done();
  });
});
