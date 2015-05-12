'use strict';

var _ = require('lodash');

var env = process.env.NODE_ENV || 'development';

var options = require('./options.' + env + '.js');

var seneca = require('seneca')(options.main);

seneca.options(options);

if (options['postgresql-store']) {
  seneca.use('postgresql-store');
}
else {
  seneca.use('mem-store', { web: { dump: true } });
}

seneca
  .use('ng-web')
  .use('user', { confirm: true })
  .use('auth')
  .use('../lib/auth/cd-auth.js')
  .use('../lib/charter/cd-charter.js')
  .use('../lib/dojos/cd-dojos.js')
  .use('../lib/countries/cd-countries.js')
  .use('../lib/geonames/cd-geonames.js')
  .use('../lib/users/cd-users.js')
  .use('../lib/agreements/cd-agreements.js')
  .use('../lib/profiles/cd-profiles.js')
;

_.each(options.client, function(opts) {
   seneca.client(opts);
});

// add some test data if running with in-memory store
if (!options['mongo-store']) {
  seneca
    .use('../test/lib/test-user-data.js')
  ;

  seneca.ready(function () {
    seneca.act('role:test-user-data,cmd:insert', function (err) {
      console.log('test-user-data insert done');
    });
  });
}

module.exports = function(){
  return seneca.export('web');
};
