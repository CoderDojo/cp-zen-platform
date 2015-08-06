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

  seneca.add({role: plugin, cmd: 'countries_continents'}, proxy);
  seneca.add({role: plugin, cmd: 'list_countries'}, proxy);
  seneca.add({role: plugin, cmd: 'list_places'}, proxy);
  seneca.add({role: plugin, cmd: 'countries_lat_long'}, proxy);
  seneca.add({role: plugin, cmd: 'continents_lat_long'}, proxy);
  seneca.add({role: plugin, cmd: 'continent_codes'}, proxy);

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
    prefix: options.prefix + version + '/geo',
    pin: { role: plugin, cmd: '*' },
    map: {
      'list_countries': {GET: true, alias: 'countries'},
      'list_places': {POST: true, alias: 'places'},
      'continents_lat_long': {GET: true, alias: 'continents_lat_long'},
      'countries_lat_long': {GET: true, alias: 'countries_lat_long'},
      'continent_codes': {GET: true, alias: 'continent_codes'},
      'countries_continents': {GET: true, alias: 'countries_continents'}
    }
  }});

  return {
    name: plugin
  };

};
