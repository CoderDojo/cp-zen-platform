'use strict';

var seneca = require('seneca')({
  timeout: 10 * 60 * 1000
});

var argv = require('optimist')
  .boolean('d')
  .alias('d', 'withcleanup')
  .argv;

var env = process.env.NODE_ENV || 'development';

var options = require('../web/options.' + env + '.js');

seneca.options(options);

if (options['mongo-store']) {
  seneca.use('mongo-store');
}
else {
  seneca.use('mem-store', { web: {dump: true} });
}

seneca
  .use('user')
  .use('../test/lib/test-user-data.js');

seneca.ready(function() {

  function docleanup(done) {
    if (argv.withcleanup) {
      seneca.act({ role: 'test-user-data', cmd: 'clean', timeout: false }, done);
    }
    else {
      setImmediate(done);
    }
  }

  docleanup(function(err) {
    seneca.act({ role: 'test-user-data', cmd: 'insert', timeout: false }, function (err) {
      if (err) {
        console.log('insert test-user-data failed:', err);
      }
      else {
        console.log('test-user-data inserted successfully');
      }

      seneca.close();
    });
  });
});
