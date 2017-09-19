

const po2json = require('po2json'); // eslint-disable-line import/no-extraneous-dependencies
const languages = require('../../config/languages');
const fs = require('fs');
const CpTranslations = require('cp-translations'); // eslint-disable-line import/no-extraneous-dependencies

module.exports = [
  {
    method: 'GET',
    path: '/locale/data',
    handler(request, reply) {
      let locale = (request.query && request.query.lang) ||
                    (request.app && request.app.context && request.app.context.locality) ||
                    'en_US';
      locale = formatLocaleCode(locale);
      if (!fs.existsSync(CpTranslations.getPoFilePath('messages.po', locale))) {
        locale = 'en_US';
      }
      const format = request.query.format || 'jed';
      po2json.parseFile(CpTranslations.getPoFilePath('messages.po', locale), {
        format,
        domain: 'coder-dojo-platform',
      }, reply);
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
