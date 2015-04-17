'use strict';

var _ = require('lodash');
var url = require('url');
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

  function call_geonames(method, params, done) {
    var geonamesurl = url.format({
      protocol: 'http',
      host: 'api.geonames.org',
      pathname: method + 'JSON',
      query: _.extend({username: 'davidc'}, params)
    });
    request({
      url: geonamesurl,
      json: true
    }, function(err, res, body) {
      if (err) { return done(err); }
      if (res.statusCode !== 200) {
        return done(new Error('Geonames responded with', res.statusCode));
      }
      if (body.status) {
        return done(new Error(body.status.message));
      }
      return done(null, body);
    });
  }

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
              async.waterfall([
                function(done) {
                  call_geonames('countrySubdivision', {lat: latitude, lng: longitude, level: 4}, done);
                },
                function(geonamesData, done) {
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
                }
              ], done);
            },
            function(done) {
              async.waterfall([
                function(done) {
                  call_geonames('findNearbyPlaceName', {lat: latitude, lng: longitude, radius: 50}, done);
                },
                function(data, done) {
                  if (!data.geonames || !data.geonames.length) {
                    console.warn('No place found for', dojo.mysqlDojoId, dojo.name);
                    return done();
                  }
                  if (data.geonames.length > 1) {
                    //console.warn('Multiple places found for', dojo.mysqlDojoId, dojo.name);
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
                },
                function(done) {
                  if (dojo.placeGeonameId) {
                    seneca.make('cd/geonames').load$({}, done);
                  }
                  else {
                    return done(null, null);
                  }
                },
                function(placeGeoname, done) {
                  if (placeGeoname) {
                    for (var adminidx = 1; adminidx <= 4; adminidx++) {
                      if (placeGeoname['admin' + adminidx + 'Code']) {
                        dojo['admin' + adminidx + 'Code'] = placeGeoname['admin' + adminidx + 'Code'];
                      }
                      if (placeGeoname['admin' + adminidx + 'Name']) {
                        dojo['admin' + adminidx + 'Name'] = placeGeoname['admin' + adminidx + 'Name'];
                      }
                    }
                  }
                  if (dojo.alpha2 === 'IE' && !dojo.admin2Code) {
                    console.warn('No admin code for', dojo.mysqlDojoId, dojo.placeGeonameId, dojo.placeName, dojo.name);
                  }
                  return done();
                }
              ], done);
            },
            function(done) {
              dojosEntity.save$(dojo, function (err, response) {
                if (err) { return done(err); }
                //console.log("saved dojo..." + JSON.stringify(response.id + ':' + response.name));
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
