const _ = require('lodash');
const locale = require('locale');
const profileValidator = require('./utils/profile-validator.js');

module.exports = server => (request, reply) => {
  console.log("IN ON PREAUTH");

  const arrTranslateCookie =
    request.state && request.state.NG_TRANSLATE_LANG_KEY;
  let translateCookie = arrTranslateCookie;
  if (_.isArray(arrTranslateCookie)) {
    [translateCookie] = arrTranslateCookie;
  }
  const localesFormReq =
    (translateCookie && translateCookie.replace(/"/g, '')) ||
    request.headers['accept-language'];
  const requestLocales = new locale.Locales(localesFormReq);
  request.app.context = {
    locality: requestLocales.best(server.app.availableLocales).code,
  };

  return reply.continue();
};
