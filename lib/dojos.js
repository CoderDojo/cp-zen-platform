'use strict';

var _ = require('lodash');
var cacheTimes = require('../web/config/cache-times');
var Joi = require('joi');

var joiValidator = {
  latitude: function() {
    return Joi.number().min(-90).max(90);
  },
  longitude: function() {
    return Joi.number().min(-180).max(180);
  },
  mail: function() {
    return Joi.string().email();
  },
  alpha2: function() {
    return Joi.string().length(2).regex(/[A-Z]{2}/);
  },
  alpha3: function() {
    return Joi.string().length(3).regex(/[A-Z]{3}/);
  },
  continent: function() {
    return Joi.string().length(2).regex(/[A-Z]{2}/);
  },
  twitter: function() {
    return Joi.string();
  },
  uri: function() {
    return Joi.string().uri();
  },
  country: function() {
    return Joi.object().keys({
      countryName: Joi.string().required(),
      countryNumber: Joi.string().required(),
      continent: joiValidator.continent(),
      alpha2: joiValidator.alpha2().required(),
      alpha3: joiValidator.alpha3(),
      $$hashKey: Joi.optional()
    });
  },
  phone: function() {
    return Joi.string();
  },
  place: function() {
    return Joi.object().keys({
      nameWithHierarchy: Joi.string(),
      $$hashKey: Joi.optional()
    });
  },
  championDetails: function() {
    return {
      email: joiValidator.mail().required(),
      name: Joi.string().required(),
      dateOfBirth: Joi.date(),
      phone: joiValidator.phone(),
      country: joiValidator.country(),
      placeName: Joi.string().required(),
      county: Joi.object(),
      state: Joi.object(),
      city: Joi.object(),
      place: joiValidator.place(),
      countryName: Joi.string().required(),
      countryNumber: Joi.string().required(),
      continent: joiValidator.continent(),
      alpha2: joiValidator.alpha2().required(),
      alpha3: joiValidator.alpha3().required(),
      address1: Joi.string().required(),
      coordinates: Joi.string().required().description('sample value: 45.7488716, 21.20867929999997'),
      projects: Joi.string().required(),
      youthExperience: Joi.string().required(),
      twitter: joiValidator.twitter(),
      linkedIn: joiValidator.uri(),
      notes: Joi.string(),
      coderDojoReference: Joi.string(),
    };
  }
}

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-dojos');

  server.route([{
    method: 'GET',
    path: options.basePath + '/dojos/config',
    handler: handlers.actHandler('get_dojo_config'),
    config: {
      description: 'Config endpoint',
      notes: 'Returns the dojo configuration',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search-bounding-box',
    handler: handlers.actHandler('search_bounding_box'),
    config: {
      description: 'Search dojos',
      notes: 'Search dojos located in a bounding box area',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 500, message: 'Internal Server Error'},
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          lat: joiValidator.latitude().required(),
          lon: joiValidator.longitude().required(),
          radius: Joi.number().integer().min(0).required(),
          search: Joi.string().min(1).required()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/find',
    handler: handlers.actHandler('find'),
    config: {
      description: 'Find',
      notes: 'Find',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search',
    handler: handlers.actHandler('search'),
    config: {
      description: 'Search dojos',
      notes: 'Search dojos',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          name: Joi.string().required(),
          verified: Joi.number().integer().required(),
          email: joiValidator.mail().required(),
          creatorEmail: joiValidator.mail().required(),
          stage: Joi.number().integer().required(),
          alpha2: joiValidator.alpha2().required().description('two capital letters representing the country'),
          limit$: Joi.number().integer().min(0).required(),
          skip$: Joi.number().integer().min(0).required(),
          sort$: Joi.object().keys({
            created: Joi.number().valid(-1).valid(1).required()
          })
        }})
      }
    }
  }, {
    method: 'POST',
      path: options.basePath + '/dojos/create',
      handler: handlers.actHandlerNeedsUser('create'),
      config: {
        description: 'Create',
        notes: 'Create',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 400, message: 'Bad Request'},
              { code: 200, message: 'OK'}]
          }
        },
        validate: {
          payload: Joi.object({ dojo: {
            stage: Joi.number().integer().required(),
            notes: Joi.string().required(),
            name: Joi.string().required(),
            email: joiValidator.mail().required(),
            time: Joi.string().required(),
            country: joiValidator.country(),
            placeName: Joi.string().required(),
            county: Joi.object(),
            state: Joi.object(),
            city: Joi.object(),
            place: Joi.object().keys({
              nameWithHierarchy: Joi.string()
            }),
            countryName: Joi.string().required(),
            countryNumber: Joi.string().required().description('sample value: 642'),
            continent: joiValidator.continent(),
            alpha2: joiValidator.alpha2().required(),
            alpha3: joiValidator.alpha3().required(),
            address1: Joi.string().required(),
            coordinates: Joi.string().required().description('sample value: 45.7488716, 21.20867929999997'),
            needMentors: Joi.number().integer().required(),
            'private': Joi.number().integer().optional(),
            googleGroup: joiValidator.uri(),
            website: joiValidator.uri(),
            twitter: joiValidator.twitter(),
            supporterImage: joiValidator.uri(),
            mailingList: Joi.number().integer().required().description('sample value: 0'),
            dojoLeadId: Joi.string().guid().required(),
            emailSubject: Joi.string().required()
          }})
        }
      }
    }, {
    method: 'PUT',
    path: options.basePath + '/dojos/{id}',
    handler: handlers.actHandlerNeedsUser('update', 'id'),
    config: {
      description: 'Update',
      notes: 'Update',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  }, {
    method: 'DELETE',
    path: options.basePath + '/dojos/{id}',
    handler: handlers.actHandlerNeedsUser('delete', 'id'),
    config: {
      description: 'Delete dojo',
      notes: 'Delete a dojo providing the dojo id',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/delete/{id}',
    handler: handlers.actHandlerNeedsUser('delete', 'id'),
    config: {
      description: 'Delete dojo',
      notes: 'Delete a dojo providing the dojo id',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/by-country',
    handler: handlers.actHandler('dojos_by_country'),
    config: {
      description: 'ByCountry',
      notes: 'ByCountry',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          verified: Joi.number().valid(0).valid(1).required(),
          deleted: Joi.number().valid(0).valid(1).required()
        }})
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/state-count/{country}',
    handler: handlers.actHandler('dojos_state_count', 'country'),
    config: {
      description: 'State count',
      notes: 'State count',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos',
    handler: handlers.actHandler('list'),
    config: {
      description: 'List',
      notes: 'List',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          verified: Joi.number().valid(0).valid(1).required(),
          deleted: Joi.number().valid(0).valid(1).required(),
          fields$: Joi.array().required()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/my-dojos',
    handler: handlers.actHandlerNeedsUser('my_dojos'),
    config: {
      description: 'MyDojos',
      notes: 'MyDojos',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ search: {
          sort: Joi.object().keys({
            created: Joi.number().valid(0).valid(1).required()
          }),
          from: Joi.number().integer().min(0).required(),
          size: Joi.number().integer().min(0).required()
        }})
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/{id}',
    handler: handlers.actHandler('load', 'id'),
    config: {
      description: 'dojos',
      notes: 'dojos',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/bulk-update',
    handler: handlers.actHandlerNeedsUser('bulk_update'),
    config: {
      description: 'bulk',
      notes: 'bulk',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          id: Joi.string().guid().required(),
          verified: Joi.number().valid(0).valid(1).required(),
          dojoLeadId: Joi.string().guid().required()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/bulk-delete',
    handler: handlers.actHandlerNeedsUser('bulk_delete'),
    config: {
      description: 'bulk',
      notes: 'bulk',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          id: Joi.string().guid().required(),
          creator: Joi.string().guid().required(),
          dojoLeadId: Joi.string().guid().required()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/stats',
    handler: handlers.actHandlerNeedsUser('get_stats'),
    config: {
      description: 'get stats',
      notes: 'get stats',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/save-dojo-lead',
    handler: handlers.actHandlerNeedsUser('save_dojo_lead'),
    config: {
      description: 'lead',
      notes: 'lead',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}]
        }
      },
      validate: {
        payload: Joi.object({ dojoLead: {
          application: {
            championDetails: joiValidator.championDetails()
          },
          userId: Joi.string().guid().required(),
          email: joiValidator.mail().required(),
          currentStep: Joi.number().integer().required(),
          completed: Joi.boolean()
        }})
      }
    }
  }, {
    method: 'PUT',
    path: options.basePath + '/dojos/update-dojo-lead/{id}',
    handler: handlers.actHandlerNeedsUser('update_dojo_lead', 'id'),
    config: {
      description: 'update lead',
      notes: 'update lead',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/user-dojo-lead/{id}',
    handler: handlers.actHandlerNeedsUser('load_user_dojo_lead', 'id'),
    config: {
      description: 'load lead',
      notes: 'load lead',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/dojo-lead/{id}',
    handler: handlers.actHandlerNeedsUser('load_dojo_lead', 'id'),
    config: {
      description: 'dojo lead',
      notes: 'dojo lead',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/setup-steps',
    handler: handlers.actHandlerNeedsUser('load_setup_dojo_steps'),
    config: {
      description: 'dojo steps',
      notes: 'dojo steps',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/users',
    handler: handlers.actHandler('load_usersdojos'),
    config: {
      description: 'dojo users',
      notes: 'dojo users',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search-dojo-leads',
    handler: handlers.actHandler('search_dojo_leads'),
    config: {
      description: 'dojo leads',
      notes: 'dojo leads',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/uncompleted',
    handler: handlers.actHandler('uncompleted_dojos'),
    config: {
      description: 'uncompleted',
      notes: 'uncompleted',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/load-dojo-users',
    handler: handlers.actHandler('load_dojo_users'),
    config: {
      description: 'dojo users',
      notes: 'dojo users',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/generate-user-invite-token',
    handler: handlers.actHandler('generate_user_invite_token'),
    config: {
      description: 'user invite token',
      notes: 'user invite token',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/accept-user-invite',
    handler: handlers.actHandler('accept_user_invite'),
    config: {
      description: 'accept invite',
      notes: 'accept invite',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/request-user-invite',
    handler: handlers.actHandler('request_user_invite'),
    config: {
      description: 'request invite',
      notes: 'request invite',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/accept-user-request',
    handler: handlers.actHandler('accept_user_request'),
    config: {
      description: 'accept request',
      notes: 'accept request',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/dojos-for-user/{id}',
    handler: handlers.actHandler('dojos_for_user', 'id'),
    config: {
      description: 'dojos for user',
      notes: 'dojos for user',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/save-usersdojos',
    handler: handlers.actHandler('save_usersdojos'),
    config: {
      description: 'save user dojos',
      notes: 'save user dojos',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/remove-usersdojos/{userId}/{dojoId}',
    handler: handlers.actHandler('remove_usersdojos', ['userId', 'dojoId']),
    config: {
      description: 'remove user dojos',
      notes: 'remove user dojos',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/user-permissions',
    handler: handlers.actHandler('get_user_permissions'),
    config: {
      description: 'user permissions',
      notes: 'user permissions',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/user-types',
    handler: handlers.actHandler('get_user_types'),
    config: {
      description: 'user types',
      notes: 'user types',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/update-founder',
    handler: handlers.actHandlerNeedsUser('update_founder'),
    config: {
      description: 'update founder',
      notes: 'update founder',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search-nearest-dojos',
    handler: handlers.actHandler('search_nearest_dojos'),
    config: {
      description: 'search nearest dojo',
      notes: 'search nearest dojo',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries',
    handler: handlers.actHandler('list_countries'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'list countries',
      notes: 'list countries',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/countries/places',
    handler: handlers.actHandler('list_places'),
    config: {
      description: 'list places',
      notes: 'list places',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries/continents/lat-long',
    handler: handlers.actHandler('continents_lat_long'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'continents lat long',
      notes: 'continents lat long',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries/lat-long',
    handler: handlers.actHandler('countries_lat_long'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'countries lat long',
      notes: 'countries lat long',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries/continents/codes',
    handler: handlers.actHandler('continent_codes'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'continent codes',
      notes: 'continent codes',
      tags: ['api']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/countries/continents',
    handler: handlers.actHandler('countries_continents'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'countries continents',
      notes: 'countries continents',
      tags: ['api']
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-dojos'
};
