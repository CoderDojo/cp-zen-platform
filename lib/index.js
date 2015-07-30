'use strict';

module.exports = function (options) {
  var seneca = this;

  seneca
    .use(require('./users/user.js')),
    .use(require('./auth/cd-auth.js')),
    .use(require('./charter/cd-charter.js')),
    .use(require('./dojos/cd-dojos.js')),
    .use(require('./countries/cd-countries.js')),
    .use(require('./geonames/cd-geonames.js')),
    .use(require('./users/cd-users.js')),
    .use(require('./agreements/cd-agreements.js')),
    .use(require('./badges/cd-badges.js')),
    .use(require('./profiles/cd-profiles.js')),
    .use(require('./events/cd-events.js')),
    .use(require('./oauth2/cd-oauth2.js')),
    .use(require('./config/cd-config.js', options)), // TODO // pass this in from web/index : config.webclient)), 
    .use(require('./sys/cd-sys.js');

  return { ... };
};
