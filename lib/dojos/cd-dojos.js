'use strict';

var path = require('path');
var async = require('async');
var serve_static = require('serve-static');
var _ = require('lodash');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'cd-dojos';
  var version = '1.0';
  var ENTITY_NS = "cd/dojos";

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({ role: plugin, spec: 'web' }, spec_web);
  seneca.add({ role: plugin, cmd: 'search'}, cmd_search);
  seneca.add({ role: plugin, cmd: 'list'}, cmd_list);
  seneca.add({ role: plugin, cmd: 'create'}, cmd_create);
  seneca.add({ role: plugin, cmd: 'delete'}, cmd_delete);
  seneca.add({ role: plugin, cmd: 'my_dojos_count'}, cmd_my_dojos_count);
  seneca.add({ role: plugin, cmd: 'my_dojos_search'}, cmd_my_dojos_search);

  function cmd_search(args, done){
    var seneca = this, query = {}, dojos_ent;
    query = args.query;

    dojos_ent = seneca.make$(ENTITY_NS);
    dojos_ent.list$(query, done);
  }

  function cmd_list(args, done) {
    var seneca = this;
    seneca.make(ENTITY_NS).list$(function(err, response) {
      if(err) return done(err);
      var dojosByCountry = {};
      response = _.sortBy(response, 'country_name');
      async.each(response, function(dojo, dojoCb) {
        if(dojo.deleted === 1) return dojoCb();
        var id = dojo.id;
        if(!dojosByCountry[dojo.country_name]) {
          dojosByCountry[dojo.country_name] = {};
          dojosByCountry[dojo.country_name].dojos = [];
          dojosByCountry[dojo.country_name].dojos.push(dojo);
        } else {
          dojosByCountry[dojo.country_name].dojos.push(dojo);
        }
        dojoCb();
      }, function() {
        var countries = Object.keys(dojosByCountry);
        async.eachSeries(countries, function(countryName, cb) {
          dojosByCountry[countryName].dojos = _.sortBy(dojosByCountry[countryName].dojos, 'name');
          cb();
        }, function() {
          done(null, dojosByCountry);
        });
        
      });
    });
  }

  function cmd_create(args, done){
    var seneca = this, query = {}, dojo_ent, dojo;
    dojo = args.dojo;

    seneca.make$(ENTITY_NS).save$(dojo, function(err, response) {
      if(err){
        return done(err);
      }

      done(null, response);
    });
  }

  function cmd_delete(args, done){
    var seneca = this;
    var id = args.id;

    seneca.make$(ENTITY_NS).remove$( id, function(err){
      if(err){
        return done(err);
      }
      done();
    });
  }

  function cmd_my_dojos_count(args, done) {
    var seneca = this, query = {};
    var user = args.user;
    query._id = {$in:user.dojos};
    seneca.make$(ENTITY_NS).list$(query, function(err, response) {
      if(err) return done(err);
      done(null, response.length);
    });
  }

  function cmd_my_dojos_search(args, done){
    var seneca = this, query = {};
    var user = args.user;
    query = args.query

    if(query.skip !== undefined){
      query.skip$ = query.skip;
      delete query.skip;
    }

    if(query.limit !== undefined){
      query.limit$ = query.limit;
      delete query.limit;
    }

    if(query.sort !== undefined){
      query.sort$ = query.sort;
      delete query.sort;
    }
   
    query._id = {$in:user.dojos};
    seneca.make$(ENTITY_NS).list$(query, function(err, response) {
      if(err) return done(err);
      done(null, response);
    });
  }

  function spec_web(args, done) {
    var public_folder = path.join(__dirname, 'public');

    done(null, {
      name: 'dojos',
      public: public_folder
    });
  }

  seneca.add({ init: plugin }, function (args, done) {
    var seneca = this;

    seneca.act({ role: plugin, spec: 'web' }, function (err, spec) {
      if (err) { return done(err); }

      var serve = serve_static(spec.public);
      var prefix = '/content/' + spec.name;

      seneca.act({ role: 'web', use: function (req, res, next) {
        var origurl = req.url;
        if (0 === origurl.indexOf(prefix)) {
          req.url = origurl.substring(prefix.length);
          serve(req, res, function () {
            req.url = origurl;
            next();
          });
        }
        else {
          return next();
        }
      }});

      done();
    });
  });

  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map: {
      'search': {POST: true, alias: 'dojos/search'},
      'create': {POST: true, alias: 'dojos'},
      'delete': {DELETE: true, alias: 'dojos/:id'},
      'list'  : {GET: true, alias: 'dojos'},
      'my_dojos_count':  {POST: true, alias: 'dojos/my_dojos_count'},
      'my_dojos_search': {POST: true, alias: 'dojos/my_dojos_search'},
    }
  }});


  return {
    name: plugin
  };

}