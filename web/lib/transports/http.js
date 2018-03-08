const request = require('request-promise-native');
module.exports = class Transport{
  constructor(options) {
    return request.defaults(options);
  }
};
