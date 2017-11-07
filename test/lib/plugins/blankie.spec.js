const chai = require('chai');
const hapiFactory = require('../../../web/index');
const lab = require('lab').script();

const expect = chai.expect;
exports.lab = lab;
lab.describe('blankie/scooter', () => {
  let server;
  lab.before((done) => {
    hapiFactory.start()
      .then((_server) => { server = _server; done(); });
  });
  lab.test('should set csp', (done) => {
    server.inject('/', (res) => {
      expect(res.headers['content-security-policy']).to.equal('child-src \'none\';connect-src \'self\' https://*.intercom.io wss://*.intercom.io https://api-ping.intercom.io https://*.amazonaws.com https://www.eventbrite.com;default-src \'none\';font-src \'self\' http://fonts.gstatic.com https://fonts.gstatic.com;frame-ancestors \'none\';frame-src https://www.google.com https://www.youtube.com;img-src \'self\' \'unsafe-eval\' \'unsafe-inline\' data: * blob: *;manifest-src \'none\';media-src \'none\';object-src \'none\';script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://*.googleapis.com http://www.google-analytics.com https://www.google-analytics.com http://www.googletagmanager.com https://www.googletagmanager.com https://maps.gstatic.com https://www.gstatic.com https://widget.intercom.io https://js.intercomcdn.com https://www.google.com https://apis.google.com http://cdn.optimizely.com/js/3847550948.js http://www.googleadservices.com/pagead/conversion.js ;style-src \'self\' \'unsafe-inline\' http://fonts.googleapis.com https://fonts.googleapis.com;reflected-xss block');
      done();
    });
  });
  lab.after((done) => {
    server.stop(done);
  });
});
