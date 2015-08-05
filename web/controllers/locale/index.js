'use strict';

var path = require('path');
var po2json = require('po2json');
var languages = require('../../config/languages');

var controller = module.exports = [

  {
    method: 'GET',
    path: '/locale/data',
    // TODO add Cache-Control header
    handler: function (request, reply) {
    	var locale = (request.locals && request.locals.context && request.locals.context.locality) || 'en_US';
      locale = formatLocaleCode(locale);
    	var format = request.query.format || 'jed';
    	po2json.parseFile(path.join(__dirname, '../../locale/', locale, 'messages.po'), {
    	    format: format,
    	    domain: 'coder-dojo-platform'
    	}, reply);
    }
  },

  {
    method: 'GET',
    path: '/locale/languages',
    // TODO add Cache-Control header
    handler: function (request, reply) {
      reply(null, languages);
    }
  }

];

function formatLocaleCode(code) {
  return code.slice(0, 3) + code.charAt(3).toUpperCase() + code.charAt(4).toUpperCase();
}
