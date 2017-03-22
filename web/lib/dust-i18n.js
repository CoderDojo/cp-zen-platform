'use strict';

var dust = require('dustjs-linkedin');
var translater = require('./fn/i18n-translate');

dust.helpers.i18n = function (chunk, context, bodies, params) {
  var defaultLanguage = 'en_US';

  //get the current language from context
  var locale = (context.stack && context.stack.head && context.stack.head.context && context.stack.head.context.locality)
      || (context.stack && context.stack.tail && context.stack.tail.head && context.stack.tail.head.context && context.stack.tail.head.context.locality)
      || (context.stack && context.stack.tail && context.stack.tail.tail && context.stack.tail.tail.head && context.stack.tail.tail.head.context && context.stack.tail.tail.head.context.locality)
      || defaultLanguage;

  var translation = translater(locale, params);

  return chunk.write(translation);
};
