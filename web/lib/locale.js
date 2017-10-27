const locale = require('locale');
const languages = require('../config/languages.js');
const _ = require('lodash');

const availableLocales = new locale.Locales(_.pluck(languages, 'code'));

module.exports = function () {
  return function (req, res, next) {
    let translateCookie = req.cookies.NG_TRANSLATE_LANG_KEY;
    if (_.isArray(translateCookie)) {
      translateCookie = translateCookie[0];
    }
    const localesFormReq = (translateCookie && translateCookie.replace(/"/g, '')) || req.headers['accept-language'];

    const requestLocales = new locale.Locales(localesFormReq);

    res.locals.context = {
      locality: requestLocales.best(availableLocales).code,
    };

    next();
  };
};
