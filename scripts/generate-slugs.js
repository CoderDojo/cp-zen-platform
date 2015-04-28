'use strict';

var _ = require('lodash');
var url = require('url');
var async = require('async');
var request = require('request');
var slug = require('slug');
var seneca = require('seneca')({
  timeout: 10 * 60 * 1000
});

var env = process.env.NODE_ENV || 'development';

var args = require('yargs')
  .usage('generate slugs')
  .argv;

var options = require('../web/options.' + env + '.js');
seneca.options(options);

seneca.use('postgresql-store');

seneca.ready(function() {

  function run(cb) {
    var dojosEntity = seneca.make$('cd/dojos');
    async.waterfall([
      function(done) {
        dojosEntity.list$({limit$:'NULL'}, done);
      },
      function(dojos, done) {
        console.log('processing', dojos.length, 'dojos');

        var urlSlugs = {};

        var slugify = function(name) {
          return slug(name);
        };

        async.eachSeries(dojos, function(dojo, done) {
          //if(dojo.urlSlug) {
          //  return done();
          //}

          var baseSlug = _.chain([
            dojo.alpha2, dojo.admin1Name, dojo.placeName, dojo.name
          ]).compact().map(slugify).value().join('/').toLowerCase();

          var urlSlug = baseSlug;
          for (var idx = 1; urlSlugs[urlSlug]; urlSlug = baseSlug + '-' + idx, idx++);

          dojo.urlSlug = urlSlug;
          urlSlugs[urlSlug] = urlSlug;

          dojo.save$(done);

        }, done);
      }
    ], cb);
  }

  run(function (err) {
    if (err) {
      console.error('error:', err);
    }
    console.log("Done");
    seneca.close();
  });

});
