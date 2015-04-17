'use strict';

var _ = require('lodash');
var async = require('async');
var request = require('request');
var seneca = require('seneca')({
  timeout: 10 * 60 * 1000
});

var env = process.env.NODE_ENV || 'development';

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
        async.eachSeries(dojos, function(dojo, done) {
          if(!dojo.coordinates) {
            return done();
          }
          var latitude = dojo.coordinates.split(',')[0];
          var longitude = dojo.coordinates.split(',')[1];
          async.series([
            function(done) {
              request('http://api.geonames.org/countrySubdivisionJSON?lat='+latitude+'&lng='+longitude+'&level=4&username=davidc', function(err, res, body) {
                if (!err && res.statusCode == 200) {
                  var geonamesData = JSON.parse(body);
                  dojo.country = {
                    countryName: geonamesData.countryName,
                    geonameId: '' + geonamesData.countryId,
                    alpha2: geonamesData.countryCode
                  };
                  for (var adminidx = 1; adminidx <= 4; adminidx++) {
                    dojo['admin' + adminidx + 'Code'] = geonamesData['adminCode' + adminidx] || '';
                    dojo['admin' + adminidx + 'Name'] = geonamesData['adminName' + adminidx] || '';
                  }
                  //TODO: get rid of state/county/city
                  dojo.state = {toponymName: geonamesData.adminName1};
                  dojo.county = {toponymName: geonamesData.adminName2};
                  dojo.city = {toponymName: geonamesData.adminName3};
                  return done();
                } else {
                  return done(err || new Error('status:', res.statusCode));
                }
              });
            },
            function(done) {
              request('http://api.geonames.org/findNearbyPlaceNameJSON?lat='+latitude+'&lng='+longitude+'&radius=50&username=davidc', function(err, res, body) {
                if (!err && res.statusCode == 200) {
                  var data = JSON.parse(body);
                  if (!data.geonames || !data.geonames.length) {
                    console.warn('No place found for', dojo.mysqlDojoId, dojo.name);
                    return done();
                  }
                  if (data.geonames.length > 1) {
                    console.warn('Multiple places found for', dojo.mysqlDojoId, dojo.name);
                  }
                  var geonamesData = data.geonames[0];
                  dojo.country = {
                    countryName: geonamesData.countryName,
                    geonameId: '' + geonamesData.countryId,
                    alpha2: geonamesData.countryCode
                  };
                  for (var adminidx = 1; adminidx <= 4; adminidx++) {
                    dojo['admin' + adminidx + 'Code'] = geonamesData['adminCode' + adminidx] || '';
                    dojo['admin' + adminidx + 'Name'] = geonamesData['adminName' + adminidx] || '';
                  }
                  dojo.placeGeonameId = '' + geonamesData['geonameId'];
                  dojo.placeName = geonamesData['name'];
                  dojo.place = {
                    name: geonamesData['name'],
                    geonameId: '' + geonamesData['geonameId']
                  }
                  return done();
                } else {
                  return done(err || new Error('status:', res.statusCode));
                }
              });
            },
            function(done) {
              dojosEntity.save$(dojo, function (err, response) {
                if (err) { return done(err); }
                console.log("saved dojo..." + JSON.stringify(response.id + ':' + response.name));
                done();
              });
            }
          ], done);
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
