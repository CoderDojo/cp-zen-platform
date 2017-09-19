
const Joi = require('joi');

module.exports = function () {
  const joiValidator = {
    latitude() {
      return Joi.number().min(-90).max(90);
    },
    longitude() {
      return Joi.number().min(-180).max(180);
    },
    mail() {
      return Joi.string().email();
    },
    alpha2() {
      return Joi.string().length(2).regex(/[A-Z]{2}/);
    },
    alpha3() {
      return Joi.string().length(3).regex(/[A-Z]{3}/);
    },
    continent() {
      return Joi.string().length(2).regex(/[A-Z]{2}/);
    },
    twitter() {
      return Joi.string().regex(/^[a-z0-9_]{1,15}$/i).allow('').allow(null);
    },
    facebook() {
      return Joi.string().regex(/^[a-z0-9.]{1,}$/i).allow('').allow(null);
    },
    linkedin() {
      return Joi.string().regex(/^[a-z0-9-]{1,}$/i).allow('').allow(null);
    },
    uri() {
      return Joi.alternatives().try(Joi.string().uri(), Joi.string());
    },
    optionalUri() {
      return Joi.alternatives().try(joiValidator.uri(), Joi.string().empty(''), Joi.string().valid(null));
    },
    country() {
      return Joi.object().keys({
        countryName: Joi.string().required(),
        countryNumber: Joi.alternatives().try(Joi.string(), Joi.number()),
        continent: joiValidator.continent(),
        alpha2: joiValidator.alpha2(),
        alpha3: joiValidator.alpha3(),
      });
    },
    phone() {
      return Joi.string();
    },
    place() {
      return Joi.object().keys({
        nameWithHierarchy: Joi.string(),
        toponymName: Joi.string(),
      });
    },
    frequency() {
      return Joi.string().only(['1/w', '1/m', '2/m', 'other']);
    },
    day() {
      return Joi.number().only([1, 2, 3, 4, 5, 6, 7]);
    },
    champion(required) {
      const valid = {
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: joiValidator.mail(),
        dob: Joi.date(),
        parentEmail: joiValidator.mail(),
        parentName: Joi.string(),
        address: Joi.string(),
        phone: joiValidator.phone(),
        twitter: joiValidator.twitter(),
        linkedin: joiValidator.linkedin(),
        confidentMentoring: Joi.number(),
        confidentCoding: Joi.number(),
        reference: Joi.string().only(['search_engine', 'volunteers', 'organisations', 'developpers', 'events', 'word_of_mouth', 'family', 'media', 'other']),
        alternativeReference: Joi.string().optional(),
        isValid: Joi.boolean().required(),
        visited: Joi.boolean().required(),
      };
      let schema = Joi.object().keys(valid);
      if (required) {
        schema = schema.requiredKeys('firstName', 'lastName', 'email', 'dob', 'address',
          'phone', 'confidentCoding', 'confidentMentoring', 'reference');
      } else {
        schema = schema.optionalKeys('firstName', 'lastName', 'email', 'dob', 'address',
          'phone', 'confidentCoding', 'confidentMentoring', 'reference');
      }
      return schema;
    },
    // Even though it's a dojo, the name dojoLead is to differenciate from a finished dojo
    dojoLead(required) {
      const valid = {
        id: joiValidator.guid(),
        name: Joi.string(), // TODO: exclude Dojo from name
        firstSession: Joi.date(),
        frequency: joiValidator.frequency(),
        day: joiValidator.day().allow(null),
        startTime: Joi.string(),
        endTime: Joi.string(),
        alternativeFrequency: Joi.string().allow(null),
        requestEmail: Joi.boolean(),
        email: joiValidator.mail(),
        notes: Joi.string(),
        website: joiValidator.optionalUri(),
        twitter: joiValidator.twitter(),
        facebook: joiValidator.facebook(),
        isValid: Joi.boolean().required(),
        visited: Joi.boolean().required(),
      };
      let schema = Joi.object().keys(valid);
      const keys = ['name', 'firstSession', 'frequency', 'notes', 'requestEmail'];
      if (required) {
        keys.push('id');
        keys.push('isValid');
        schema = schema.requiredKeys(keys);
      } else {
        schema = schema.optionalKeys(keys)
          .requiredKeys('isValid');
      }
      return schema;
    },
    venue(required) {
      const valid = {
        isFound: Joi.boolean(),
        country: joiValidator.country(),
        place: joiValidator.place(),
        geoPoint: Joi.object({
          lat: Joi.number(),
          lon: Joi.number(),
        }),
        address1: Joi.string(),
        type: Joi.string().only(['office', 'public_space', 'tech_hub', 'library', 'maker_space', 'school', 'university', 'other']).allow(null),
        alternativeType: Joi.string().optional(),
        corporate: Joi.string(),
        alternativeCorporate: Joi.string().optional(),
        private: Joi.number().only(0, 1),
        isValid: Joi.boolean().required(),
        visited: Joi.boolean().required(),
      };
      let schema = Joi.object().keys(valid);
      const keys = ['isFound', 'country', 'geoPoint', 'type', 'address1', 'country', 'place'];

      if (required) {
        keys.push('isValid');
        schema = schema.requiredKeys(keys);
      } else {
        schema = schema.optionalKeys(keys)
          .requiredKeys('isValid');
      }
      return schema;
    },
    team() {
      return Joi.object().keys({
        status: Joi.string(),
        src: Joi.object().keys({
          community: Joi.boolean().allow(true),
          teachers: Joi.boolean().allow(true),
          pro: Joi.boolean().allow(true),
          students: Joi.boolean().allow(true),
          staff: Joi.boolean().allow(true),
          youth: Joi.boolean().allow(true),
          parents: Joi.boolean().allow(true),
          other: Joi.boolean().allow(true),
        }),
        alternativeSrc: Joi.string(),
        isValid: Joi.boolean().required(),
        visited: Joi.boolean().required(),
      });
    },
    charter() {
      const valid = {
        id: Joi.string(),
        fullName: Joi.string(),
        isValid: Joi.boolean().required(),
        visited: Joi.boolean().required(),
      };
      return Joi.object().keys(valid);
    },
    application(required) {
      const application = {
        champion: required ? joiValidator.champion(required).required() : joiValidator.champion(),
        dojo: required ? joiValidator.dojoLead(required).required() : joiValidator.dojoLead(),
        venue: required ? joiValidator.venue(required).required() : joiValidator.venue(),
        team: required ? joiValidator.team(required).required() : joiValidator.team(),
        charter: required ? joiValidator.charter(required).required() : joiValidator.charter(),
      };
      return Joi.object().keys(application);
    },
    user() {
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
          title: Joi.string(),
        }),
        joinRequests: Joi.any(),
        lastLogin: Joi.date(),
        lmsId: Joi.any(),
        profileId: Joi.any(),
      });
    },
    guid() {
      return Joi.alternatives().try(Joi.string().guid(), Joi.string());
    },
  };
  return joiValidator;
};
