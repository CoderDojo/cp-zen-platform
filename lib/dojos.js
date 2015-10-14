'use strict';

var _ = require('lodash');
var cacheTimes = require('../web/config/cache-times');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-dojos');

  server.route([{
    method: 'GET',
    path: options.basePath + '/dojos/config',
    handler: handlers.actHandler('get_dojo_config')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search-bounding-box',
    handler: handlers.actHandler('search_bounding_box')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/find',
    handler: handlers.actHandler('find')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search',
    handler: handlers.actHandler('search')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/create',
    handler: handlers.actHandlerNeedsUser('create')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/update/{id}',
    handler: handlers.actHandlerNeedsUser('update', 'id')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/delete/{id}',
    handler: handlers.actHandlerNeedsUser('delete', 'id')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/by-country',
    handler: handlers.actHandler('dojos_by_country')
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/state-count/{country}',
    handler: handlers.actHandler('dojos_state_count', 'country')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/list',
    handler: handlers.actHandler('list')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos',
    handler: handlers.actHandler('list')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/my-dojos',
    handler: handlers.actHandlerNeedsUser('my_dojos')
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/{id}',
    handler: handlers.actHandler('load', 'id')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/bulk-update',
    handler: handlers.actHandlerNeedsUser('bulk_update')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/bulk-delete',
    handler: handlers.actHandlerNeedsUser('bulk_delete')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/stats',
    handler: handlers.actHandlerNeedsUser('get_stats')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/save-dojo-lead',
    handler: handlers.actHandlerNeedsUser('save_dojo_lead')
  }, {
    method: 'PUT',
    path: options.basePath + '/dojos/update-dojo-lead/{id}',
    handler: handlers.actHandlerNeedsUser('update_dojo_lead', 'id')
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/user-dojo=lead/{id}',
    handler: handlers.actHandlerNeedsUser('load_user_dojo_lead', 'id')
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/dojo-lead/{id}',
    handler: handlers.actHandlerNeedsUser('load_dojo_lead', 'id')
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/setup-steps',
    handler: handlers.actHandlerNeedsUser('load_setup_dojo_steps')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/users',
    handler: handlers.actHandler('load_usersdojos')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search-dojo-leads',
    handler: handlers.actHandler('search_dojo_leads')
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/uncompleted',
    handler: handlers.actHandler('uncompleted_dojos')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/load-dojo-users',
    handler: handlers.actHandler('load_dojo_users')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/generate-user-invite-token',
    handler: handlers.actHandler('generate_user_invite_token')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/accept-user-invite',
    handler: handlers.actHandler('accept_user_invite')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/request-user-invite',
    handler: handlers.actHandler('request_user_invite')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/accept-user-request',
    handler: handlers.actHandler('accept_user_request')
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/dojos-for-user/{id}',
    handler: handlers.actHandler('dojos_for_user', 'id')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/save-usersdojos',
    handler: handlers.actHandler('save_usersdojos')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/remove-usersdojos/{userId}/{dojoId}',
    handler: handlers.actHandler('remove_usersdojos', ['userId', 'dojoId'])
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/user-permissions',
    handler: handlers.actHandler('get_user_permissions')
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/user-types',
    handler: handlers.actHandler('get_user_types')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/update-founder',
    handler: handlers.actHandlerNeedsUser('update_founder')
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search-nearest-dojos',
    handler: handlers.actHandler('search_nearest_dojos')
  }, {
    method: 'GET',
    path: options.basePath + '/countries',
    handler: handlers.actHandler('list_countries'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/countries/places',
    handler: handlers.actHandler('list_places')
  }, {
    method: 'GET',
    path: options.basePath + '/countries/continents/lat-long',
    handler: handlers.actHandler('continents_lat_long')
  }, {
    method: 'GET',
    path: options.basePath + '/countries/lat-long',
    handler: handlers.actHandler('countries_lat_long')
  }, {
    method: 'GET',
    path: options.basePath + '/countries/continents/codes',
    handler: handlers.actHandler('continent_codes')
  }, {
    method: 'GET',
    path: options.basePath + '/countries/continents',
    handler: handlers.actHandler('countries_continents')
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-dojos'
};
