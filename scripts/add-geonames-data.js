'use strict';

var _ = require('lodash');
var async = require('async');
var http = require('http');
var mongodb = require("mongodb"), objectID = mongodb.BSONPure.ObjectID;
var seneca = require('seneca')({
  timeout: 10 * 60 * 1000
});

var env = process.env.NODE_ENV || 'development';

var options = require('../web/options.' + env + '.js');
seneca.options(options);

seneca.use('mongo-store');

seneca.ready(function() {

  function run(done) {
    var dojosEntity = seneca.make$('cd/dojos');
    dojosEntity.list$(function(err, response) {
      if(err) return cb(err);
      async.eachLimit(response, 5, function(dojo, cb) {
        if(!dojo.coordinates) return cb();
        if(objectID.isValid(dojo.id)) return cb(); //We don't need to update Dojo's with ObjectId as id type.
        var latitude = dojo.coordinates.split(',')[0];
        var longitude = dojo.coordinates.split(',')[1];
        
        http.get("http://api.geonames.org/countrySubdivisionJSON?lat="+latitude+"&lng="+longitude+"&level=4&username=davidc", function(res) {
          var data = '';
          res.setEncoding('utf8');
          res.on("data", function(chunk) {
            data += chunk;
          });
          res.on('end', function() {
            data = JSON.parse(data);
            console.log(JSON.stringify(data));
            if(data.countryName) dojo.country = {countryName:data.countryName};
            if(data.adminName1) dojo.state = {toponymName:data.adminName1};
            if(data.adminName2) dojo.county = {toponymName:data.adminName2};
            if(data.adminName3) dojo.city = {toponymName:data.adminName3};
            var id = parseInt(dojo.id);
            dojosEntity.remove$(id, function(err, response) {
              if(err) return cb(err);
              dojosEntity.save$(dojo, function(err, response) {
                if(err) return cb(err);
                console.log("saved dojo..." + JSON.stringify(response.id + ':' +response.name));
                cb();
              });
            });
          });
        }).on('error', function(e) {
          return cb(e);
        });
      }, done);
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
