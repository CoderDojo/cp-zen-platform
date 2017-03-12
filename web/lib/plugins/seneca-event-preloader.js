/**
 * Prepare an object usable for openGraph containing information for an event
 * @param  {Object}   request
 * @param  {Function} cb      Callback assigning the preloaded object and continuing
 */
var translater = require('../fn/i18n-translate');
var _ = require('lodash');
module.exports = function (request, cb) {
  var preloaded = {};
  var context = request.locals.context;
  var defaultLanguage = 'en_US';

  request.seneca.act({role: 'cd-events', cmd: 'getEvent', id: request.params['eventId']},
    function (err, event) {
      if (err || !event) return cb(); // If metadata fails to load, continue loading the page normally
      var now = new Date();
      _.some(event.dates, function (date) {
        var formattedDate = new Date(date.startTime);
        if (formattedDate > now) {
          event.date = formattedDate.getUTCDate() + '/' + formattedDate.getUTCMonth() + '/' + formattedDate.getUTCFullYear();
          return true;
        }
      });
      request.seneca.act({role: 'cd-dojos', cmd: 'load', id: event.dojoId},
        function (err, dojo) {
          if (err || !dojo) return cb();
          //  TODO: This locale is frankly a hack, we need a "per-dojo" language
          var locale = dojo.alpha2.toLowerCase() + '_' + dojo.alpha2 || defaultLanguage;

          preloaded.title = translater(locale, {key: 'CoderDojo %1s | Zen',
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
