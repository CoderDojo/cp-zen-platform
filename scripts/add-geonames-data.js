'use strict';

var _ = require('lodash');
var url = require('url');
var path = require('path');
var fs = require('fs');
var async = require('async');
var request = require('request');
var seneca = require('seneca')({
  timeout: 10 * 60 * 1000
});

var env = process.env.NODE_ENV || 'development';

var args = require('yargs')
  .usage('reverse geocode and add geonames data to existing dojos based on coordinates')
  .example('node add-geonames-data.js --throttle 50 --username davidc')
  .string('username')
  .describe('username', 'geonames api username')
  .default('username', 'davidc')
  .alias('username', 'u')
  .describe('throttle', 'throttle geonames request in milliseconds')
  .alias('throttle', 't')
  .default('throttle', 100)
  .boolean('ignore-cache')
  .boolean('update-cache')
  .string('cache-path')
  .argv;

var options = require('../web/options.' + env + '.js');
seneca.options(options);

seneca.use('postgresql-store');

var geonamesCache = {};
var geonamesCachePath = args['cache-path'] ?
  path.resolve(args['cache-path']) :
  path.join(__dirname, 'geonames-cache/data.json');

if (!args['ignore-cache']) {
  if (fs.existsSync(geonamesCachePath)) {
    geonamesCache = require(geonamesCachePath);
  }
}

seneca.ready(function() {

  function call_geonames(method, params, done) {
    var geonamesurl = url.format({
      protocol: 'http',
      host: 'api.geonames.org',
      pathname: method + 'JSON',
      query: _.extend({username: args.username}, params)
    });
    var cachekey = url.format({
      pathname: method + 'JSON',
      query: params
    });
    if (geonamesCache[cachekey]) {
      return done(null, geonamesCache[cachekey]);
    }
    else {
      request({
        url: geonamesurl,
        json: true
      }, function (err, res, body) {
        if (err) { return done(err); }
        if (res.statusCode !== 200) {
          return done(new Error('Geonames responded with', res.statusCode));
        }
        if (body.status) {
          if (body.status.value === 14) {
            console.warn('Geonames', method, 'called with invalid parameters', JSON.stringify(params));
            return done(null, null);
          }
          // not results found
          if (body.status.value === 15) {
            return done(null, null);
          }
          // hourly limit exceeded
          if (body.status.value === 19) {
            // wait?
          }
          console.error(JSON.stringify(body.status));
          console.log(JSON.stringify(params));
          return done(new Error(body.status.message));
        }
        setTimeout(function () {
          geonamesCache[cachekey] = body;
          return done(null, body);
        }, args.throttle);
      });
    }
  }

  function run(cb) {
    var dojosEntity = seneca.make$('cd/dojos');
    async.waterfall([
      function(done) {
        dojosEntity.list$({limit$:'NULL'}, done);
      },
      function(dojos, done) {
        console.log('processing', dojos.length, 'dojos');
        async.eachSeries(dojos, function(dojo, done) {
          if (!dojo.coordinates) {
            return done();
          }
          // skip dojos that are already resolved
          //if (dojo.placeGeonameId) {
          //  return done();
          //}

          var coordsPair = _.trim(dojo.coordinates, '@').split(',').map(parseFloat);
          if (coordsPair.length === 2 && _.isFinite(coordsPair[0]) && _.isFinite(coordsPair[1])) {
            dojo.geoPoint = {
              lat: coordsPair[0],
              lon: coordsPair[1]
            }
          }

          if (!dojo.geoPoint) {
            return done();
          }

          var latitude = coordsPair[0];
          var longitude = coordsPair[1];

          async.series([
            function(done) {
              async.waterfall([
                function(done) {
                  call_geonames('countrySubdivision', {lat: latitude, lng: longitude, level: 4}, done);
                },
                function(geonamesData, done) {
                  if (geonamesData) {
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
                  }
                  else {
                    console.warn('No administrative country subdivision found for', dojo.mysqlDojoId, dojo.name);
                  }
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
                  if (!data || !data.geonames || !data.geonames.length) {
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
                    seneca.make('cd/geonames').load$({geonameId: dojo.placeGeonameId}, done);
                  }
                  else {
                    return done(null, null);
                  }
                },
                function(placeGeoname, done) {
                  if (placeGeoname) {
                    for (var adminidx = 1; adminidx <= 4; adminidx++) {
                      if (!dojo['admin' + adminidx + 'Code'] && placeGeoname['admin' + adminidx + 'Code']) {
                        dojo['admin' + adminidx + 'Code'] = placeGeoname['admin' + adminidx + 'Code'];
                      }
                      if (!dojo['admin' + adminidx + 'Name'] && placeGeoname['admin' + adminidx + 'Name']) {
                        dojo['admin' + adminidx + 'Name'] = placeGeoname['admin' + adminidx + 'Name'];
                      }
                    }
                  }
                  if (dojo.alpha2 === 'IE' && !dojo.admin2Code) {
                    console.warn('Missing admin 2 code for', dojo.mysqlDojoId, dojo.placeGeonameId, dojo.placeName, dojo.name);
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
    ], function(err) {
      async.series([
        function(done) {
          if (args['update-cache']) {
            fs.writeFile(geonamesCachePath, JSON.stringify(geonamesCache), done);
          }
          else {
            setImmediate(done);
          }
        }
      ], function() {
        return cb(err);
      });
    });
  }

  run(function (err) {
    if (err) {
      console.error('error:', err);
    }
    console.log("Done");
    seneca.close();
  });

});
