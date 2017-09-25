/**
 * Prepare an object usable for openGraph containing information for a dojo
 * @param  {Object}   request
 * @param  {Function} cb      Callback assigning the preloaded object and continuing
 */
const translater = require('../fn/i18n-translate');
const languages = require('country-language');

module.exports = function (request, cb) {
  const preloaded = {};
  const defaultLanguage = 'en_US';
  request.seneca.act({ role: 'cd-dojos',
    cmd: 'find',
    query: { urlSlug: `${request.params.id}/${request.params.alpha2}` } },
  (err, dojo) => {
    if (err || !dojo) return cb(); // If metadata fails to load, continue loading the page normally
    const localesFromCountry = languages.getCountryMsLocales(dojo.alpha2);
    let locale = (localesFromCountry && localesFromCountry[0].langCultureName) || defaultLanguage;
    locale = locale.replace('-', '_');
    preloaded.title = translater(locale, { key: '%1s | CoderDojo',
      var: dojo.name });
    preloaded.description = translater(locale, { key: '%1s in %2s',
      var: [dojo.name, dojo.countryName] });
    preloaded.image = [];
    preloaded.image.push(`https://s3-eu-west-1.amazonaws.com/zen-dojo-images/${dojo.id}`);
    preloaded['image:width'] = 300;
    preloaded['image:height'] = 300;
    return cb(preloaded);
  });
};
