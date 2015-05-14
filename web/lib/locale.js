'use strict';

var locale = require('locale');

var availableLocales = new locale.Locales(['en_US', 'de_DE']);

module.exports = function () {
  return function (req, res, next) {
    var requestLocales = new locale.Locales(req.headers['accept-language']);

    res.locals.context = {
      locality: requestLocales.best(availableLocales).code //.replace('_', '-')
    };

    next();
  };
};
