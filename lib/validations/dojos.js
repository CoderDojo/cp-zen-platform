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
        twitter: joiValidator.twitter().allow(''),
        // What about facebook?
        // facebook: joiValidator.facebook(),
        linkedin: joiValidator.linkedin(),
        confidentMentoring: Joi.number(),
        confidentCoding: Joi.number(),
        coderDojoReference: Joi.string(),
        coderDojoReferenceOther: Joi.string(),
        isValid: Joi.boolean()

        // country: joiValidator.country(),
        // placeName: Joi.string(),
        // county: Joi.object().allow(null),
        // state: Joi.object().allow(null),
        // city: Joi.object().allow(null),
        // place: joiValidator.place(),
        // countryName: Joi.string().required(),
        // countryNumber: Joi.number().integer(),
        // continent: joiValidator.continent(),
        // alpha2: joiValidator.alpha2().required(),
        // alpha3: joiValidator.alpha3(),
        // coordinates: Joi.string(),
        // youthExperience: Joi.string().allow(''),
      };
      if (required) {
        _.each(['firstName', 'lastName', 'email', 'dateOfBirth', 'address', 'phone', 'confidentCoding', 'confidentMentoring', 'coderDojoReference'],
          function (key) {
            valid[key].required();
          });
      }
      return Joi.object().keys(valid);
    },
    // Even though it's a dojo, the name dojoLead is to differenciate from a finished dojo
    dojoLead: function (required) {
      var valid = {
        name: Joi.string(), // TODO: exclude Dojo from name
        firstSession: Joi.date(),
        frequency: Joi.string(),
        email: joiValidator.mail(),
        website: joiValidator.optionalUri(),
        twitter: joiValidator.twitter().allow(''),
        facebook: joiValidator.facebook(),
        isValid: Joi.boolean()
      };
      if (required) {
        _.each(['name', 'firstSession', 'frequency'],
          function (key) {
            valid[key].required();
          });
      }
      return Joi.object().keys(valid);
    },
    venue: function (required) {
      var valid = {
        address: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
        type: Joi.string(),
        typeOption: Joi.string(),
        corporate: Joi.string(),
        corporateOption: Joi.string(),
        isValid: Joi.boolean()
      };
      if (required) {
        _.each(['address', 'city', 'state', 'country', 'type', 'corporate'],
          function (key) {
            valid[key].required();
          });
      }
      return Joi.object().keys(valid);
    },
    team: function () {
      return Joi.object().keys({
        joinedMembers: Joi.array(),
        invitedMembers: Joi.array(),
        alone: Joi.boolean(),
        isValid: Joi.boolean()
      });
    },
    charter: function () {
      var valid = {
        version: Joi.number(),
        signed_at: Joi.string(),
        signature: Joi.string(),
        isValid: Joi.boolean()
      };
      return Joi.object().keys(valid);
    },
    application: function (required) {
      var application = {
        champion: required ? joiValidator.champion() : joiValidator.champion(required).required(),
        dojo: required ? joiValidator.dojoLead() : joiValidator.dojoLead(required).required(),
        venue: required ? joiValidator.venue() : joiValidator.venue(required).required(),
        team: required ? joiValidator.team() : joiValidator.team(required).required(),
        charter: required ? joiValidator.charter() : joiValidator.charter(required).required()
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
  // // Make all fields required for the specified validations
  // _.each(['venue', 'team', 'dojoLead', 'champion'], function (key) {
  //   var copy = _.clone(joiValidator[key]);
  //   console.log('copy', copy);
  //   _.each(copy, function (key) {
  //     console.log(key);
  //     copy[key].required();
  //   });
  //   joiValidator[key + 'Required'] = copy;
  // });
  return joiValidator;
};
