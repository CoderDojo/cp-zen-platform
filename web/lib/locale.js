'use strict';

var locale = require('locale');
var languages = require('../config/languages.js');
var _ = require('lodash');

var availableLocales = new locale.Locales(_.pluck(languages, 'code'));

module.exports = function () {
  return function (req, res, next) {
    var localesFormReq = (req.cookies['NG_TRANSLATE_LANG_KEY'] && req.cookies['NG_TRANSLATE_LANG_KEY'].replace(/\"/g, '')) || req.headers['accept-language'];
    
    var requestLocales = new locale.Locales(localesFormReq);
    
    res.locals.context = {
      locality: requestLocales.best(availableLocales).code
    };

    next();
  };
};
