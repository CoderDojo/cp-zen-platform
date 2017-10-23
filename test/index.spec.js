const expect = require('chai').expect;
const lab = require('lab').script();
const server = require('../web/index');

exports.lab = lab;
lab.experiment('setup server', () => {
  lab.before(() => {
    console.log('before');
    return server.start();
  });
  lab.test('should load plugins', () => {
    expect(server.options.plugins).to.be.an('array');
    return expect(server.options.plugins.length).to.be.equal(14);
  });
  lab.test('should start server');
  lab.test('should set cors');
  lab.test('should define locality');
  lab.test('should set locale onPreAuth');
  lab.describe('onPreResponse', () => {
    lab.test('should set headers for cp-host');
    lab.test('should log on 400');
    lab.test('should continue for any api endpoint');
    lab.test('should continue for anything that is not a 404 or a 401');
    lab.test('should redirect to cdf login');
    lab.test('should log');
    lab.test('ultimately should render the index view');
  });

  lab.describe('onPreResponse 2', () => {
    lab.test('should call http-error-handler');
  });
});
