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
    return Joi.alternatives().try(Joi.string().uri(), Joi.string());
  },
  country: function() {
    return Joi.object().keys({
      countryName: Joi.string().required(),
      countryNumber: Joi.number().integer(),
      continent: joiValidator.continent(),
      alpha2: joiValidator.alpha2(),
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
      toponymName: Joi.string(),
      $$hashKey: Joi.optional()
    });
  },
  championDetails: function() {
    return Joi.object().keys({
      email: joiValidator.mail().required(),
      name: Joi.string().required(),
      dateOfBirth: Joi.date(),
      phone: joiValidator.phone(),
      country: joiValidator.country(),
      placeName: Joi.string(),
      county: Joi.object().allow(null),
      state: Joi.object().allow(null),
      city: Joi.object().allow(null),
      place: joiValidator.place(),
      countryName: Joi.string().required(),
      countryNumber: Joi.number().integer(),
      continent: joiValidator.continent(),
      alpha2: joiValidator.alpha2().required(),
      alpha3: joiValidator.alpha3(),
      address1: Joi.string().required(),
      coordinates: Joi.string(),
      projects: Joi.string().allow(""),
      youthExperience: Joi.string().allow(""),
      twitter: joiValidator.twitter().allow(""),
      linkedIn: joiValidator.uri().allow(""),
      notes: Joi.string().allow(""),
      coderDojoReference: Joi.string(),
      coderDojoReferenceOther: Joi.string()
    });
  },
  setupYourDojo: function() {
    return Joi.object().keys({
      findTechnicalMentors: Joi.boolean(),
      findTechnicalMentorsText: Joi.string(),
      findNonTechnicalMentors: Joi.boolean(),
      findNonTechnicalMentorsText: Joi.string().allow("").allow(null),
      locateVenue: Joi.boolean(),
      locateVenueText: Joi.string(),
      setDojoDateAndTime: Joi.boolean(),
      setDojoDateAndTimeText: Joi.string(),
      setDojoEmailAddress: Joi.boolean(),
      setupSocialMedia: Joi.boolean(),
      embodyCoderDojoTao: Joi.boolean(),
      backgroundCheck: Joi.boolean(),
      backgroundCheckText: Joi.string().allow("").allow(null),
      ensureHealthAndSafety: Joi.boolean(),
      ensureHealthAndSafetyText: Joi.string().allow("").allow(null),
      ensureInsuranceCover: Joi.boolean(),
      ensureInsuranceCoverText: Joi.string().allow("").allow(null),
      planContent: Joi.boolean(),
      setupTicketingAndRegistration: Joi.boolean(),
      connectOtherDojos: Joi.boolean(),
      onlineSafetyBestPractice: Joi.boolean(),
      onlineSafetyBestPracticeText: Joi.string().allow("").allow(null),
      dataProtectionRegulated: Joi.boolean(),
      dataProtectionRegulatedText: Joi.string().allow("").allow(null),
      diversityRespected: Joi.boolean(),
      diversityRespectedText: Joi.string().allow("").allow(null),
      engageCoderDojoMovement: Joi.boolean(),
      engageCoderDojoMovementText: Joi.string().allow("").allow(null)
    });
  },
  application: function() {
    return Joi.object().keys({
      championDetails: joiValidator.championDetails(),
      setupYourDojo: joiValidator.setupYourDojo(),
      dojoListing: Joi.object()
    });
  },
  user: function() {
    return Joi.object().keys({
      id: joiValidator.guid().required(),
      nick: Joi.string(),
      email: joiValidator.mail().required(),
      name: Joi.string().required(),
      username: Joi.any(),
      activated: Joi.any(),
      level: Joi.any(),
      mysqlUserId: Joi.any(),
      firstName: Joi.any(),
      lastName: Joi.any(),
      roles: Joi.array().required(),
      phone: Joi.any(),
      mailingList: Joi.any(),
      termsConditionsAccepted: Joi.any(),
      when: Joi.date(),
      confirmed: Joi.any(),
      admin: Joi.any(),
      modified: Joi.any(),
      locale: Joi.any(),
      banned: Joi.any(),
      banReason: Joi.any(),
      initUserType: Joi.object().keys({
        name: Joi.string(),
        title: Joi.string()
      }),
      joinRequests: Joi.any(),
      lastLogin: Joi.date()
    });
  },
  guid: function() {
    return Joi.alternatives().try(Joi.string().guid(), Joi.string());
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
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          lat: joiValidator.latitude().required(),
          lon: joiValidator.longitude().required(),
          radius: Joi.number().min(0).required(),
          search: Joi.string()
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
          dojoLeadId: joiValidator.guid(),
          urlSlug: Joi.string()
        }})
      }
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
          name: Joi.string().optional(),
          verified: Joi.number().integer(),
          email: Joi.string().optional(),
          creatorEmail: Joi.string().optional(),
          stage: Joi.number().integer().optional(),
          alpha2: joiValidator.alpha2().optional().description('two capital letters representing the country'),
          limit$: Joi.number().integer().min(0).optional(),
          skip$: Joi.number().integer().min(0).optional(),
          sort$: Joi.object().keys({
            created: Joi.number().valid(-1).valid(1).optional()
          })
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/manage-dojos',
    handler: handlers.actHandlerNeedsCdfAdmin('search'),
    config: {
      description: 'Search dojos for manage dojos page',
      notes: 'Only accessible by cdf-admins',
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
          name: Joi.string().optional(),
          verified: Joi.number().integer(),
          email: Joi.string().optional(),
          creatorEmail: Joi.string().optional(),
          stage: Joi.number().integer().optional(),
          alpha2: joiValidator.alpha2().optional().description('two capital letters representing the country'),
          limit$: Joi.number().integer().min(0).optional(),
          skip$: Joi.number().integer().min(0).optional(),
          sort$: Joi.object().keys({
            created: Joi.number().valid(-1).valid(1).optional(),
            name: Joi.number().valid(-1).valid(1).optional(),
            stage: Joi.number().valid(-1).valid(1).optional(),
            alpha2: Joi.number().valid(-1).valid(1).optional(),
            email: Joi.number().valid(-1).valid(1).optional()
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
            email: joiValidator.mail(),
            time: Joi.string().required(),
            country: joiValidator.country(),
            placeName: Joi.string().required(),
            county: Joi.object().allow(null),
            state: Joi.object().allow(null),
            city: Joi.object().allow(null),
            place: joiValidator.place(),
            countryName: Joi.string().required(),
            countryNumber: Joi.number().integer(),
            continent: joiValidator.continent(),
            alpha2: joiValidator.alpha2().required(),
            alpha3: joiValidator.alpha3().required(),
            address1: Joi.string().required(),
            coordinates: Joi.string().required(),
            expectedAttendees: Joi.number().allow(null),
            needMentors: Joi.number().integer(),
            taoVerified: Joi.number().integer(),
            'private': Joi.number().valid(0).valid(1),
            googleGroup: joiValidator.uri(),
            website: joiValidator.uri(),
            twitter: joiValidator.twitter(),
            supporterImage: joiValidator.uri(),
            mailingList: Joi.number().integer(),
            dojoLeadId: joiValidator.guid().required(),
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
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        params: {
          id: Joi.string().required()
        },
        payload: Joi.object({ dojo: {
          entity$: Joi.string(),
          id: joiValidator.guid(),
          mysqlDojoId: Joi.any(),
          dojoLeadId: joiValidator.guid(),
          name: Joi.string(),
          creator: joiValidator.guid(),
          created: Joi.date(),
          verifiedAt: Joi.alternatives().try(Joi.date(), Joi.string().valid(null)),
          verifiedBy: Joi.alternatives().try(joiValidator.guid(), Joi.string().valid(null)),
          verified: Joi.number().valid(0).valid(1),
          needMentors: Joi.number().valid(0).valid(1),
          taoVerified: Joi.number().valid(0).valid(1),
          stage: Joi.number().integer(),
          mailingList: Joi.number().integer(),
          time: Joi.string().required(),
          country: joiValidator.country(),
          county: Joi.object().allow(null),
          state: Joi.object().allow(null),
          city: Joi.object().allow(null),
          place: joiValidator.place(),
          coordinates: Joi.string(),
          geoPoint: Joi.object().keys({
            lat: joiValidator.latitude(),
            lon: joiValidator.longitude()
          }),
          notes: Joi.string().allow("").allow(null),
          email: Joi.alternatives().try(joiValidator.mail(), Joi.string().valid(null).valid("")),
          googleGroup: Joi.alternatives().try(joiValidator.uri(), Joi.string().valid(null).valid("")),
          expectedAttendees: Joi.number().allow(null),
          website: Joi.alternatives().try(joiValidator.uri(), Joi.string().valid(null).valid("")),
          twitter: Joi.alternatives().try(joiValidator.twitter(), Joi.string().valid(null).valid("")),
          ebId: Joi.any(),
          supporterImage: Joi.alternatives().try(joiValidator.uri(), Joi.string().valid(null), Joi.string().valid("")),
          deleted: Joi.number().valid(0).valid(1),
          deletedBy: Joi.any(),
          deletedAt: Joi.any(),
          'private': Joi.number().valid(0).valid(1),
          urlSlug: Joi.string(),
          continent: joiValidator.continent(),
          alpha2: joiValidator.alpha2(),
          alpha3: joiValidator.alpha3(),
          address1: Joi.string(),
          address2: Joi.any(),
          countryNumber: Joi.number().integer(),
          countryName: Joi.string(),
          admin1Code: Joi.any(),
          admin1Name: Joi.any(),
          admin2Code: Joi.any(),
          admin2Name: Joi.any(),
          admin3Code: Joi.any(),
          admin3Name: Joi.any(),
          admin4Code: Joi.any(),
          admin4Name: Joi.any(),
          placeGeonameId: Joi.any(),
          placeName: Joi.string(),
          userInvites: Joi.alternatives().try(Joi.array().items(Joi.object().keys({
            id: Joi.string(),
            email: joiValidator.mail(),
            userType: Joi.string(),
            timestamp: Joi.date()
          })), Joi.string().valid(null)),
          creatorEmail: joiValidator.mail(),
          emailSubject: Joi.string(),
          editDojoFlag: Joi.boolean()
        }})
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
            { code: 400, message: 'Bad Request'},
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
          verified: Joi.number().valid(0).valid(1),
          deleted: Joi.number().valid(0).valid(1)
        }})
      }
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
        payload: Joi.alternatives().try(Joi.any(), Joi.object({ query: {
          name: Joi.string(),
          verified: Joi.number().valid(0).valid(1),
          stage: Joi.number().integer(),
          deleted: Joi.number().valid(0).valid(1),
          alpha2:joiValidator.alpha2(),
          fields$: Joi.array()
        }}))
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
            created: Joi.number().valid(0).valid(1)
          }),
          from: Joi.number().integer().min(0),
          size: Joi.number().integer().min(0)
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
        payload: Joi.object({ dojos:
          Joi.array().items(Joi.object().keys({
            id: joiValidator.guid(),
            verified: Joi.number().valid(0).valid(1),
            dojoLeadId: joiValidator.guid()
          }))
        })
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
        payload: Joi.object({ dojos:
          Joi.array().items(Joi.object().keys({
            id: joiValidator.guid(),
            creator: joiValidator.guid(),
            dojoLeadId: joiValidator.guid()
          }))
        })
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
            { code: 400, message: 'Bad Request'},
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
          application: joiValidator.application(),
          userId: joiValidator.guid().required(),
          email: joiValidator.mail().required(),
          currentStep: Joi.number().integer(),
          migration: Joi.any(),
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
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}]
        }
      },
      validate: {
        params: {
          id: Joi.string().required()
        },
        payload: Joi.object({ dojoLead: {
          entity$: Joi.string(),
          userId: joiValidator.guid().required(),
          email: joiValidator.mail().required(),
          application: joiValidator.application(),
          currentStep: Joi.number().integer(),
          id: joiValidator.guid().required(),
          completed: Joi.boolean(),
          deleted: Joi.number().valid(0).valid(1),
          deletedBy: Joi.any(),
          deletedAt: Joi.any(),
          converted: Joi.any(),
          migration: Joi.any()
        }})
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/user-dojo-lead/{id}',
    handler: handlers.actHandlerNeedsUser('load_user_dojo_lead', 'id'),
    config: {
      description: 'load lead',
      notes: 'load lead',
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
    method: 'GET',
    path: options.basePath + '/dojos/dojo-lead/{id}',
    handler: handlers.actHandlerNeedsUser('load_dojo_lead', 'id'),
    config: {
      description: 'dojo lead',
      notes: 'dojo lead',
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
    method: 'GET',
    path: options.basePath + '/dojos/setup-steps',
    handler: handlers.actHandlerNeedsUser('load_setup_dojo_steps'),
    config: {
      description: 'dojo steps',
      notes: 'dojo steps',
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
    path: options.basePath + '/dojos/users',
    handler: handlers.actHandler('load_usersdojos'),
    config: {
      description: 'dojo users',
      notes: 'dojo users',
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
          dojoId: Joi.alternatives().try(joiValidator.guid(), Joi.string().valid("")),
          userId: joiValidator.guid(),
          deleted: Joi.number().valid(0).valid(1),
          owner: Joi.number().valid(1).valid(0),
          limit$: Joi.number().integer().min(0).optional(),
          skip$: Joi.number().integer().min(0).optional()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/search-dojo-leads',
    handler: handlers.actHandler('search_dojo_leads'),
    config: {
      description: 'dojo leads',
      notes: 'dojo leads',
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
          userId: joiValidator.guid()
        }})
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/uncompleted',
    handler: handlers.actHandler('uncompleted_dojos'),
    config: {
      description: 'uncompleted',
      notes: 'uncompleted',
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
    path: options.basePath + '/dojos/load-dojo-users',
    handler: handlers.actHandlerNeedsDojoAdmin('load_dojo_users'),
    config: {
      description: 'dojo users',
      notes: 'dojo users',
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
          dojoId: joiValidator.guid(),
          deleted: Joi.number().valid(0).valid(1),
          limit$: Joi.alternatives().try(Joi.number().integer().min(0), Joi.string()),
          skip$: Joi.number().integer().min(0).optional(),
          sort$: Joi.object().keys({
            name: Joi.number().valid(-1).valid(1).optional(),
            email: Joi.number().valid(-1).valid(1).optional()
          }),
          userType: Joi.string(),
          name: Joi.string()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/generate-user-invite-token',
    handler: handlers.actHandlerNeedsUser('generate_user_invite_token'),
    config: {
      description: 'user invite token',
      notes: 'user invite token',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}]
        }
      },
      validate: {
        payload: Joi.object({
          email: joiValidator.mail().required(),
          emailSubject: Joi.string(),
          userType: Joi.string(),
          dojoId: joiValidator.guid().required()
        })
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/accept-user-invite',
    handler: handlers.actHandlerNeedsUser('accept_user_invite'),
    config: {
      description: 'accept invite',
      notes: 'accept invite',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/request-user-invite',
    handler: handlers.actHandlerNeedsUser('request_user_invite'),
    config: {
      description: 'request invite',
      notes: 'request invite',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}]
        }
      },
      validate: {
        payload: Joi.object({ data: {
          user: joiValidator.user().required(),
          dojoId: joiValidator.guid().required(),
          userType: Joi.string(),
          emailSubject: Joi.string()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/accept-user-request',
    handler: handlers.actHandlerNeedsUser('accept_user_request'),
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
    path: options.basePath + '/dojos/save-usersdojos',
    handler: handlers.actHandlerNeedsUser('save_usersdojos'),
    config: {
      description: 'save user dojos',
      notes: 'save user dojos',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}]
        }
      },
      validate: {
        payload: Joi.object({ userDojo: {
          entity$: Joi.string(),
          id: joiValidator.guid(),
          mysqlUserId: Joi.any(),
          mysqlDojoId: Joi.any(),
          owner: Joi.number().valid(1).valid(0),
          userId: joiValidator.guid(),
          dojoId: joiValidator.guid(),
          userTypes: Joi.array(),
          userPermissions: Joi.alternatives().try(Joi.array(), Joi.string().valid(null)),
          backgroundChecked: Joi.boolean(),
          deleted: Joi.number().valid(0).valid(1),
          deletedBy: Joi.any(),
          deletedAt: Joi.any()
        }})
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/remove-usersdojos/{userId}/{dojoId}',
    handler: handlers.actHandlerNeedsUser('remove_usersdojos', ['userId', 'dojoId']),
    config: {
      description: 'remove user dojos',
      notes: 'remove user dojos',
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
        params: {
          userId: joiValidator.guid().required(),
          dojoId: joiValidator.guid().required()
        }
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojos/user-permissions',
    handler: handlers.actHandler('get_user_permissions'),
    config: {
      description: 'user permissions',
      notes: 'user permissions',
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
    method: 'GET',
    path: options.basePath + '/dojos/user-types',
    handler: handlers.actHandler('get_user_types'),
    config: {
      description: 'user types',
      notes: 'user types',
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
          lat: joiValidator.latitude().required(),
          lon: joiValidator.longitude().required()
        }})
      }
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
    path: options.basePath + '/countries/places',
    handler: handlers.actHandler('list_places'),
    config: {
      description: 'list places',
      notes: 'list places',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request'},
            { code: 200, message: 'OK'}]
        }
      },
      validate: {
        payload: Joi.object({ search: {
          countryCode: joiValidator.alpha2().required(),
          search: Joi.string().required()
        }})
      }
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
    method: 'GET',
    path: options.basePath + '/countries/lat-long',
    handler: handlers.actHandler('countries_lat_long'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'countries lat long',
      notes: 'countries lat long',
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
    method: 'GET',
    path: options.basePath + '/countries/continents/codes',
    handler: handlers.actHandler('continent_codes'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'continent codes',
      notes: 'continent codes',
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
    method: 'GET',
    path: options.basePath + '/countries/continents',
    handler: handlers.actHandler('countries_continents'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'countries continents',
      notes: 'countries continents',
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
    path: options.basePath + '/dojos/notify-all-members',
    handler: handlers.actHandlerNeedsUser('notify_all_members'),
    config: {
      description: 'notify all dojo members',
      notes: 'notify all dojo members',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}]
        }
      },
      validate: {
        payload: Joi.object({ data: {
          dojoId: Joi.alternatives().try(joiValidator.guid(), Joi.string().valid("")),
          eventId: Joi.alternatives().try(joiValidator.guid(), Joi.string().valid("")),
          emailSubject: Joi.string().required()
        }})
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-dojos'
};
