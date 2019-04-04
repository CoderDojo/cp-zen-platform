const Joi = require('joi');
const auth = require('../../lib/authentications');
const dojoHandlers = require('../../lib/handlers/dojo');
const membershipHandlers = require('../../lib/handlers/membership');
const joiValidator = require('../validations/dojos')();

const basePath = '/api/2.0';
const basePath3 = '/api/3.0';

module.exports = [
  {
    method: 'PATCH',
    path: `${basePath}/dojos/{id}/verified`,
    handler: dojoHandlers.verify(),
    config: {
      auth: auth.apiUser,
      description: 'Update the verification of a dojo',
      notes: 'Update',
      tags: ['api', 'dojos', 'verification'],
      plugins: {
        cpPermissions: {
          profiles: [
            { role: 'cdf-admin' },
          ],
        },
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          id: Joi.string().guid().required(),
        },
        payload: Joi.object({
          verified: Joi.number().valid(0).valid(1),
        }),
      },
    },
  },
  {
    method: 'PUT',
    path: `${basePath}/dojos/{dojoId}`,
    handler: dojoHandlers.update(),
    config: {
      auth: auth.apiUser,
      description: 'Update',
      notes: 'Update',
      tags: ['api', 'dojos'],
      plugins: {
        cpPermissions: {
          profiles: [
            {
              role: 'basic-user',
              customValidator: [{
                role: 'cd-dojos',
                cmd: 'have_permissions_on_dojo',
                perm: 'dojo-admin',
              }],
            },
          ],
        },
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          dojoId: Joi.string().required(),
        },
        payload: Joi.object({
          dojo: {
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
            day: joiValidator.day().allow(null),
            frequency: joiValidator.frequency().required(),
            alternativeFrequency: Joi.string().allow(null),
            startTime: Joi.string().allow(null),
            endTime: Joi.string().allow(null),
            country: joiValidator.country(),
            county: joiValidator.area().allow(null),
            state: joiValidator.area().allow(null),
            city: Joi.object().allow(null),
            place: joiValidator.place(),
            coordinates: Joi.string(),
            geoPoint: Joi.object().keys({
              lat: joiValidator.latitude(),
              lon: joiValidator.longitude(),
            }),
            notes: Joi.string().allow('').allow(null),
            email: Joi.alternatives().try(joiValidator.mail(), Joi.string().valid(null).valid('')),
            googleGroup: joiValidator.optionalUri(),
            expectedAttendees: Joi.number().allow(null),
            website: joiValidator.optionalUri(),
            twitter: joiValidator.twitter(),
            facebook: joiValidator.facebook(),
            ebId: Joi.any(),
            supporterImage: joiValidator.optionalUri(),
            deleted: Joi.number().valid(0).valid(1),
            deletedBy: Joi.any(),
            deletedAt: Joi.any(),
            private: Joi.number().valid(0).valid(1),
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
              timestamp: Joi.date(),
            })), Joi.string().valid(null)),
            creatorEmail: joiValidator.mail(),
            emailSubject: Joi.string(),
            editDojoFlag: Joi.boolean(),
          },
        }),
      },
    },
  },
  {
    method: 'POST',
    path: `${basePath3}/dojos/{id}/membership-requests`,
    handler: membershipHandlers.request(),
    config: {
      auth: auth.apiUser,
      description: 'Request to join a Dojo',
      notes: 'Saves in the user profile and send an email to the Dojo owner',
      tags: ['api', 'dojos', 'membership'],
      plugins: {
        cpPermissions: {
          profiles: [
            { role: 'basic-user' },
          ],
        },
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          id: Joi.string().guid().required(),
        },
        payload: Joi.object({
          userType: joiValidator.userTypes().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: `${basePath3}/dojos/{id}/membership-requests/{requestId}`,
    handler: membershipHandlers.loadPending(),
    config: {
      auth: auth.apiUser,
      description: 'Load a membership request',
      notes: 'Return a specific membership request',
      tags: ['api', 'dojos', 'membership'],
      plugins: {
        cpPermissions: {
          profiles: [
            { role: 'basic-user',
              customValidator: [{
                role: 'cd-users',
                cmd: 'can_accept_join_request',
              }],
            },
          ],
        },
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: { 
          // Optional for retro-compat behavior
          // Nothing is being validated through it, only the membership request Id is being used
          id: Joi.string().guid().required().valid('undefined'),
          requestId: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'PUT',
    path: `${basePath3}/dojos/{id}/membership-requests/{requestId}`,
    handler: membershipHandlers.accept(),
    config: {
      auth: auth.apiUser,
      description: 'Transform a request to join into a membership',
      notes: 'Modify a request to join into a membership from the users list to the dojo memberships table',
      tags: ['api', 'dojos', 'membership'],
      plugins: {
        cpPermissions: {
          profiles: [
            { role: 'basic-user',
              // We don't use the dojoId and have_permissions_on_dojo
              // because the dojoId could be different from the one of the join_request
              customValidator: [{
                role: 'cd-users',
                cmd: 'can_accept_join_request',
              }],
            },
          ],
        },
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          id: Joi.string().guid().required(),
          requestId: Joi.string().required(), // not a guid, a shortId
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: `${basePath3}/dojos/{id}/membership-requests/{requestId}`,
    handler: membershipHandlers.refuse(),
    config: {
      auth: auth.apiUser,
      description: 'Remove a request to join',
      notes: 'Remove a request to join a club from the users list of join requests',
      tags: ['api', 'dojos', 'membership'],
      plugins: {
        cpPermissions: {
          profiles: [
            { role: 'basic-user',
              // We don't use the dojoId and have_permissions_on_dojo
              // because the dojoId could be different from the one of the join_request
              customValidator: [{
                role: 'cd-users',
                cmd: 'can_accept_join_request',
              }],
            },
          ],
        },
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          id: Joi.string().guid().required(),
          requestId: Joi.string().required(), // not a guid, a shortId
        },
      },
    },
  },
];
