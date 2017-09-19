const locale = require('locale');
const _ = require('lodash');
const languages = require('../config/languages.js');

const availableLocales = new locale.Locales(_.pluck(languages, 'code'));

module.exports = () => ({ cookies, headers }, { locals }, next) => {
  let translateCookie = cookies.NG_TRANSLATE_LANG_KEY;
  if (_.isArray(translateCookie)) {
    translateCookie = translateCookie[0];
  }
  const localesFormReq =
    (translateCookie && translateCookie.replace(/"/g, '')) || headers['accept-language'];

  const requestLocales = new locale.Locales(localesFormReq);

  locals.context = {
    locality: requestLocales.best(availableLocales).code,
  };

  next();
};
