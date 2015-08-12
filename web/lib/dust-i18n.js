'use strict';

var path = require('path');
var dust = require('dustjs-linkedin');
var po2json = require('po2json');
var Jed = require('jed');
var fs = require('fs');
var translators = {};

function getTranslator(locale) {
  if (!translators[locale]) {
    if (!fs.existsSync(path.join(__dirname, '../locale/', locale, 'messages.po'))) {
      locale = 'en_US';
    }
    var podata = po2json.parseFileSync(path.join(__dirname, '../locale/', locale, 'messages.po'), {
      format: 'jed',
      domain: 'coder-dojo-platform'
    });
    translators[locale] = new Jed(podata);
  }

  return translators[locale];
}

dust.helpers.i18n = function (chunk, context, bodies, params) {
  var defaultLanguage = 'en_US';

  //get the current language from context
  var locale = (context.stack && context.stack.head && context.stack.head.context && context.stack.head.context.locality)
      || (context.stack && context.stack.tail && context.stack.tail.head && context.stack.tail.head.context && context.stack.tail.head.context.locality)
      || (context.stack && context.stack.tail && context.stack.tail.tail && context.stack.tail.tail.head && context.stack.tail.tail.head.context && context.stack.tail.tail.head.context.locality)
      || defaultLanguage;

  var translation = getTranslator(locale).translate(params.key);
  if (params.context) {
    translation = translation.withContext(params.context);
  }
  translation = params.count
    ? translation.ifPlural(params.count, params.key).fetch(params.count)
    : translation.fetch();

  return chunk.write(translation);
};
