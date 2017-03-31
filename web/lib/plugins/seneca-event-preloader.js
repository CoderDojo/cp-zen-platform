/**
 * Prepare an object usable for openGraph containing information for an event
 * @param  {Object}   request
 * @param  {Function} cb      Callback assigning the preloaded object and continuing
 */
var translater = require('../fn/i18n-translate');
var _ = require('lodash');
var languages = require('country-language');
var moment = require('moment');
module.exports = function (request, cb) {
  var preloaded = {};
  var defaultLanguage = 'en_US';

  request.seneca.act({role: 'cd-events', cmd: 'getEvent', id: request.params['eventId']},
    function (err, event) {
      if (err || !event) return cb(); // If metadata fails to load, continue loading the page normally
      var now = new Date();
      _.some(event.dates, function (date) {
        var x = moment.utc(date.startTime);
        var y = x.subtract(x.utcOffset(), 'minutes');
        var formattedDate = new Date(date.startTime);
        if (formattedDate > now) {
          event.date = y.format('YYYY/MM/DD');
          return true;
        }
      });
      request.seneca.act({role: 'cd-dojos', cmd: 'load', id: event.dojoId},
        function (err, dojo) {
          if (err || !dojo) return cb();
          var locale = languages.getCountryMsLocales(dojo.alpha2)[0].langCultureName || defaultLanguage;

          preloaded.title = translater(locale, {key: '%1s | CoderDojo',
            var: dojo.name});
          preloaded.description = translater(locale, {key: '%1s at %2s on %3s',
           var: [event.name, dojo.name, event.date]});
          preloaded.image = [];
          preloaded.image.push('https://s3-eu-west-1.amazonaws.com/zen-dojo-images/' + dojo.id);
          preloaded['image:width'] = 300;
          preloaded['image:height'] = 300;
          return cb(preloaded);
        });
    });
};
