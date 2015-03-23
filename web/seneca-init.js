'use strict';

var env = process.env.NODE_ENV || 'development';

var options = require('./options.' + env + '.js');

var seneca = require('seneca')(options.main);

seneca.options(options);

if (options['mongo-store']) {
  seneca.use('mongo-store');
}
else {
  seneca.use('mem-store', { web: { dump: true } });
}

seneca
  .use('ng-web')
  .use('user', { confirm: true })
  .use('auth')
  .use('account')
  .use('data-editor')
  .use('admin')
  .use('user-roles')
  .use('web-access')
  .use('perm')
  .use('../lib/auth/cd-auth.js')
  .use('../lib/charter/cd-charter.js')
;


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
