'use strict';

var locale = require('locale');

var availableLocales = new locale.Locales(['en_US', 'de_DE']);

module.exports = function () {
  return function (req, res, next) {
    var localesFormReq = req.cookies['NG_TRANSLATE_LANG_KEY'].replace(/\"/g, '') || req.headers['accept-language'];

    var requestLocales = new locale.Locales(localesFormReq);
    res.locals.context = {
      locality: requestLocales.best(availableLocales).code //.replace('_', '-')
    };

    next();
  };
};
