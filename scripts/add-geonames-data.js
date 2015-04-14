'use strict';

var _ = require('lodash');
var async = require('async');

var seneca = require('seneca')({
  timeout: 10 * 60 * 1000
});

var env = process.env.NODE_ENV || 'development';

var options = require('../web/options.' + env + '.js');
seneca.options(options);

seneca.use('mongo-store');

seneca.ready(function() {

  function run(cb) {
    
    

  }

  run(function (err) {
    if (err) {
      console.error('error:', err);
    }
    console.log("Done");
    seneca.close();
  });

});
