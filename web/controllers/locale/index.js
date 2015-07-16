'use strict';

var path = require('path');
var po2json = require('po2json');
var languages = require('../../config/languages');

var controller = module.exports = [

  {
    method: 'GET',
    path: '/locale/data',
    handler: function (request, reply) {
	// TODO hapi equivalent of reply.locals?
	var locale = (reply.locals && reply.locals.context && reply.locals.context.locality) || 'en_US';
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
    handler: function (request, reply) {
      reply(null, languages);
    }
  }

];
