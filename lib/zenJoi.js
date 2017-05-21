/**
 * Joi Validator
 */
(function () {
    'use strict';
    var Joi = require('joi');
    module.exports = {
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
        uri: function () {
            return Joi.alternatives().try(Joi.string().uri(), Joi.string());
        },
        optionalUri: function () {
            return Joi.alternatives().try(this.uri(), Joi.string().empty(''), Joi.string().valid(null));
        },
        country: function () {
            return Joi.object().keys({
                countryName: Joi.string().required(),
                countryNumber: Joi.number().integer(),
                continent: this.continent(),
                alpha2: this.alpha2(),
                alpha3: this.alpha3(),
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
        championDetails: function () {
            return Joi.object().keys({
                email: this.mail().required(),
                name: Joi.string().required(),
                dateOfBirth: Joi.date(),
                phone: this.phone(),
                country: this.country(),
                placeName: Joi.string(),
                county: Joi.object().allow(null),
                state: Joi.object().allow(null),
                city: Joi.object().allow(null),
                place: this.place(),
                countryName: Joi.string().required(),
                countryNumber: Joi.number().integer(),
                continent: this.continent(),
                alpha2: this.alpha2().required(),
                alpha3: this.alpha3(),
                address1: Joi.string().required(),
                coordinates: Joi.string(),
                projects: Joi.string().allow(''),
                youthExperience: Joi.string().allow(''),
                twitter: this.twitter().allow(''),
                linkedIn: this.uri().allow(''),
                notes: Joi.string().allow(''),
                coderDojoReference: Joi.string(),
                coderDojoReferenceOther: Joi.string()
            });
        },
        setupYourDojo: function () {
            return Joi.object().keys({
                findTechnicalMentors: Joi.boolean(),
                findTechnicalMentorsText: Joi.string(),
                findNonTechnicalMentors: Joi.boolean(),
                findNonTechnicalMentorsText: Joi.string().allow('').allow(null),
                locateVenue: Joi.boolean(),
                locateVenueText: Joi.string(),
                setDojoDateAndTime: Joi.boolean(),
                setDojoDateAndTimeText: Joi.string(),
                setDojoEmailAddress: Joi.boolean(),
                setupSocialMedia: Joi.boolean(),
                embodyCoderDojoTao: Joi.boolean(),
                backgroundCheck: Joi.boolean(),
                backgroundCheckText: Joi.string().allow('').allow(null),
                ensureHealthAndSafety: Joi.boolean(),
                ensureHealthAndSafetyText: Joi.string().allow('').allow(null),
                ensureInsuranceCover: Joi.boolean(),
                ensureInsuranceCoverText: Joi.string().allow('').allow(null),
                planContent: Joi.boolean(),
                setupTicketingAndRegistration: Joi.boolean(),
                connectOtherDojos: Joi.boolean(),
                onlineSafetyBestPractice: Joi.boolean(),
                onlineSafetyBestPracticeText: Joi.string().allow('').allow(null),
                dataProtectionRegulated: Joi.boolean(),
                dataProtectionRegulatedText: Joi.string().allow('').allow(null),
                diversityRespected: Joi.boolean(),
                diversityRespectedText: Joi.string().allow('').allow(null),
                engageCoderDojoMovement: Joi.boolean(),
                engageCoderDojoMovementText: Joi.string().allow('').allow(null)
            });
        },
        application: function () {
            return Joi.object().keys({
                championDetails: this.championDetails(),
                setupYourDojo: this.setupYourDojo(),
                dojoListing: Joi.object()
            });
        },
        user: function () {
            return Joi.object().keys({
                id: this.guid().required(),
                nick: Joi.string(),
                email: this.mail().required(),
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

}());