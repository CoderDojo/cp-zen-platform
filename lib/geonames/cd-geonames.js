'use strict';

var _ = require('lodash');
var path = require('path');
var async = require('async');
var http = require('http');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'cd-geonames';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'list_countries'}, proxy);
  seneca.add({role: plugin, cmd: 'list_places'}, proxy);
  seneca.add({role: plugin, cmd: 'countries_lat_long'}, proxy);
  seneca.add({role: plugin, cmd: 'continents_lat_long'}, proxy);


  function proxy(args, done) {
    seneca.act(seneca.util.argprops(
      {user:args.req$.seneca.login.user},
      args,
      {role:'cd-geonames'}
    ), done);
  }

  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/geo',
    pin: { role: plugin, cmd: '*' },
    map: {
      'list_countries': {GET: true, alias: 'countries'},
      'list_places': {GET: true, alias: 'places/:countryCode'},
      'continents_lat_long': {GET: true, alias: 'continents_lat_long'},
      'countries_lat_long': {GET: true, alias: 'countries_lat_long'}
    }
  }});

  return {
    name: plugin
  };

};