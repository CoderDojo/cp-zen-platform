/**
 * Prepare an object usable for openGraph containing information for an event
 * @param  {Object}   request
 * @param  {Function} cb      Callback assigning the preloaded object and continuing
 */
const translater = require('../fn/i18n-translate');
const _ = require('lodash');
const languages = require('country-language');
const moment = require('moment');

module.exports = function (request, cb) {
  const preloaded = {};
  const defaultLanguage = 'en_US';

  request.seneca.act({ role: 'cd-events', cmd: 'getEvent', id: request.params.eventId },
    (err, event) => {
      if (err || !event) return cb(); // continue loading if metadata fails to load (non-fatal)
      const now = new Date();
      _.some(event.dates, (date) => {
        const x = moment.utc(date.startTime);
        const y = x.subtract(x.utcOffset(), 'minutes');
        const formattedDate = new Date(date.startTime);
        if (formattedDate > now) {
          event.date = y.format('YYYY/MM/DD');
          return true;
        }
      });
      request.seneca.act({ role: 'cd-dojos', cmd: 'load', id: event.dojoId },
        (dErr, dojo) => {
          if (dErr || !dojo) return cb();
          const localesFromCountry = languages.getCountryMsLocales(dojo.alpha2);
          let locale = (localesFromCountry && localesFromCountry[0].langCultureName) ||
                        defaultLanguage;
          locale = locale.replace('-', '_');
          preloaded.title = translater(locale, { key: '%1s | CoderDojo',
            var: dojo.name });
          preloaded.description = translater(locale, { key: '%1s at %2s on %3s',
            var: [event.name, dojo.name, event.date] });
          preloaded.image = [];
          preloaded.image.push(`https://s3-eu-west-1.amazonaws.com/zen-dojo-images/${dojo.id}`);
          preloaded['image:width'] = 300;
          preloaded['image:height'] = 300;
          return cb(preloaded);
        });
    });
};
