//  NOTE : Permissions post-auth is handled by the act itself, not by hapijs
// TODO: only do where you must, levae others as they were when check in
module.exports = {
  //  Navigation
  basicUser: {
    strategies: ['seneca-login', 'header'],
    scope: ['basic-user'],
  },
  cdfAdmin: {
    strategies: ['seneca-login', 'header'],
    scope: ['cdf-admin'],
  },
  //  Api
  userIfPossible: {
    strategies: ['seneca-login', 'header'],
    mode: 'try',
    scope: ['basic-user', 'cdf-admin'],
  },
  apiUser: {
    strategies: ['seneca-login', 'header'],
    scope: ['basic-user', 'cdf-admin'],
  },
};
