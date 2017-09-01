//  NOTE : should we split rules for api from rules for navigation ?
module.exports = {
  //  Navigation
  basicUser: {
    strategy: 'seneca-login',
    scope: ['basic-user'],
  },
  cdfAdmin: {
    strategy: 'seneca-login',
    scope: ['cdf-admin'],
  },
  //  Api
  userIfPossible: {
    strategy: 'seneca-login',
    mode: 'try',
    scope: ['basic-user', 'cdf-admin'],
  },
  apiUser: {
    strategy: 'seneca-login',
    scope: ['basic-user', 'cdf-admin'],
  },
};
