'use strict';

var path = require('path');
var po2json = require('po2json');
var languages = require('../../config/languages');
var fs = require('fs');
var CpTranslations = require('cp-translations');

var controller = module.exports = [
  {
    method: 'GET',
    path: '/locale/data',
    handler: function (request, reply) {
    	var locale = (request.query && request.query.lang) || (request.app && request.app.context && request.app.context.locality) || 'en_US';
      locale = formatLocaleCode(locale);
      if (!fs.existsSync(CpTranslations.getPoFilePath('messages.po', locale))) {
        locale = 'en_US';
      }
    	var format = request.query.format || 'jed';
    	po2json.parseFile(CpTranslations.getPoFilePath('messages.po', locale), {
        format: format,
        domain: 'coder-dojo-platform'
    	}, reply);
    }
  },

  {
    method: 'GET',
    path: '/locale/languages',
    handler: function (request, reply) {
      reply(null, languages);
    }
  }

];

function formatLocaleCode(code) {
  return code.slice(0, 3) + code.charAt(3).toUpperCase() + code.charAt(4).toUpperCase();
}
