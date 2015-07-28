'use strict';

var _ = require('lodash');
var path = require('path');
var async = require('async');
var http = require('http');
var serve_static = require('serve-static');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'cd-countries';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

//  seneca.add({role: plugin, cmd: 'list'}, proxy);
//  seneca.add({role: plugin, cmd: 'countries_lat_long'}, proxy);
//  seneca.add({role: plugin, cmd: 'continents_lat_long'}, proxy);
  seneca.add({role: plugin, cmd: 'countries_continents'}, proxy);
  seneca.add({role: plugin, cmd: 'county_from_coordinates'}, proxy);


  function proxy(args, done) {
    var user = {};
    if(args.req$.seneca.login) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role:'cd-countries'}
    ), done);
  }

  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map: {
      'list': {GET: true, alias: 'countries'},
      'continents_lat_long': {GET: true, alias: 'continents_lat_long'},
      'countries_lat_long': {GET: true, alias: 'countries_lat_long'},
      'countries_continents': {GET: true, alias: 'countries_continents'},
      'county_from_coordinates': {GET:true, alias: 'county_from_coordinates/:coordinates'}
    }
  }});

  return {
    name: plugin
  };

};
