const po2json = require('po2json');
const languages = require('../../config/languages');
const fs = require('fs-extra');
const cpTranslations = require('cp-translations');

module.exports = [
  {
    method: 'GET',
    path: '/locale/data',
    handler({ query, locals }, reply) {
      let locale =
        (query && query.lang) || (locals && locals.context && locals.context.locality) || 'en_US';
      locale = formatLocaleCode(locale);
      if (!fs.existsSync(cpTranslations.getPoFilePath('messages.po', locale))) {
        locale = 'en_US';
      }
      const format = query.format || 'jed';
      po2json.parseFile(
        cpTranslations.getPoFilePath('messages.po', locale),
        {
          format,
          domain: 'coder-dojo-platform',
        },
        reply,
      );
    },
  },

  {
    method: 'GET',
    path: '/locale/languages',
    handler(request, reply) {
      reply(null, languages);
    },
  },
];

function formatLocaleCode(code) {
  return code.slice(0, 3) + code.charAt(3).toUpperCase() + code.charAt(4).toUpperCase();
}
