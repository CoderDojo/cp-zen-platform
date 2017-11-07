

const seneca = require('./index');

seneca.ready(() => {
  console.log('seneca ready');
});

module.exports = function () {
  return seneca.export('web');
};
