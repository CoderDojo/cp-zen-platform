'use strict';
var _ = require('lodash');
var Joi = require('joi');
module.exports = function () {
  var joiValidator = {
    latitude: function () {
      return Joi.number().min(-90).max(90);
    },
    longitude: function () {
      return Joi.number().min(-180).max(180);
    },
    mail: function () {
      return Joi.string().email();
    },
    alpha2: function () {
      return Joi.string().length(2).regex(/[A-Z]{2}/);
    },
    alpha3: function () {
      return Joi.string().length(3).regex(/[A-Z]{3}/);
    },
    continent: function () {
      return Joi.string().length(2).regex(/[A-Z]{2}/);
    },
    twitter: function () {
      return Joi.string().allow('');
    },
    facebook: function () {
      return Joi.string().regex(/^https:\/\/www\.facebook\.com\//).allow('');
    },
    linkedin: function () {
      return Joi.string().regex(/^https:\/\/www\.linkedin\.com\/in\//).allow('');
    },
    uri: function () {
      return Joi.alternatives().try(Joi.string().uri(), Joi.string());
    },
    optionalUri: function () {
      return Joi.alternatives().try(joiValidator.uri(), Joi.string().empty(''), Joi.string().valid(null));
    },
    country: function () {
      return Joi.object().keys({
        countryName: Joi.string().required(),
        countryNumber: Joi.number().integer(),
        continent: joiValidator.continent(),
        alpha2: joiValidator.alpha2(),
        alpha3: joiValidator.alpha3(),
        $$hashKey: Joi.optional()
      });
    },
    phone: function () {
      return Joi.string();
    },
    place: function () {
      return Joi.object().keys({
        nameWithHierarchy: Joi.string(),
        toponymName: Joi.string(),
        $$hashKey: Joi.optional()
      });
    },
    champion: function (required) {
      var valid = {
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: joiValidator.mail(),
        dob: Joi.date(),
        parentEmail: joiValidator.mail(),
        parentName: Joi.string(),
        address: Joi.string(),
        phone: joiValidator.phone(),
        twitter: joiValidator.twitter().allow('').allow(null),
        // What about facebook?
        // facebook: joiValidator.facebook(),
        linkedin: joiValidator.linkedin().allow('').allow(null),
        confidentMentoring: Joi.number(),
        confidentCoding: Joi.number(),
        reference: Joi.string(),
        alternativeReference: Joi.string().optional(),
        isValid: Joi.boolean().required()
      };
      var schema = Joi.object().keys(valid);
      if (required) {
        schema = schema.requiredKeys('firstName', 'lastName', 'email', 'dob', 'address',
         'phone', 'confidentCoding', 'confidentMentoring', 'reference');
      } else {
        schema = schema.optionalKeys('firstName', 'lastName', 'email', 'dob', 'address',
         'phone', 'confidentCoding', 'confidentMentoring', 'reference');
      }
      console.log(schema._inner.children);
      return schema;
    },
    // Even though it's a dojo, the name dojoLead is to differenciate from a finished dojo
    dojoLead: function (required) {
      var valid = {
        name: Joi.string(), // TODO: exclude Dojo from name
        firstSession: Joi.date(),
        frequency: Joi.string(),
        alternativeFrequency: Joi.string(),
        email: joiValidator.mail(),
        requestEmail: Joi.boolean(),
        website: joiValidator.optionalUri(),
        twitter: joiValidator.twitter().allow(''),
        facebook: joiValidator.facebook(),
        isValid: Joi.boolean().required()
      };
      var schema = Joi.object().keys(valid);
      if (required) {
        schema = schema.requiredKeys('name', 'firstSession', 'frequency');
      } else {
        schema = schema.optionalKeys('name', 'firstSession', 'frequency');
      }
      return schema;
    },
    venue: function (required) {
      var valid = {
        isFound: Joi.boolean(),
        address: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
        type: Joi.string(),
        alternativeType: Joi.string().optional(),
        corporate: Joi.string(),
        alternativeCorporate: Joi.string().optional(),
        isValid: Joi.boolean().required()
      };
      var schema = Joi.object().keys(valid);
      if (required) {
        schema = schema.requiredKeys('address', 'city', 'state', 'country', 'type', 'corporate');
      } else {
        schema = schema.optionalKeys('address', 'city', 'state', 'country', 'type', 'corporate');
      }
      return schema;
    },
    team: function () {
      return Joi.object().keys({
        joinedMembers: Joi.array(),
        invitedMembers: Joi.array(),
        status: Joi.boolean(),
        isValid: Joi.boolean().required()
      });
    },
    charter: function () {
      var valid = {
        id: Joi.string(),
        fullName: Joi.string(),
        isValid: Joi.boolean().required()
      };
      return Joi.object().keys(valid);
    },
    application: function (required) {
      console.log('applicationReq', required);
      var application = {
        champion: required ? joiValidator.champion(required).required() : joiValidator.champion(),
        dojo: required ? joiValidator.dojoLead(required).required() : joiValidator.dojoLead(),
        venue: required ? joiValidator.venue(required).required() : joiValidator.venue(),
        team: required ? joiValidator.team(required).required() : joiValidator.team(),
        charter: required ? joiValidator.charter(required).required() : joiValidator.charter()
      };
      return Joi.object().keys(application);
    },
    user: function () {
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
        lastLogin: Joi.date(),
        lmsId: Joi.any(),
        profileId: Joi.any()
      });
    },
    guid: function () {
      return Joi.alternatives().try(Joi.string().guid(), Joi.string());
    }
  };
  return joiValidator;
};
