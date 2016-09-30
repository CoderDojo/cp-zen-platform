'use strict';

var path = require('path');
var dust = require('dustjs-linkedin');
var po2json = require('po2json');
var Jed = require('jed');
var fs = require('fs');
var I18NHelper = require('cp-i18n-lib');
var i18nHelper = new I18NHelper({
  poFilePath: path.resolve('web/locale/'),
  poFileName: 'messages.po',
  domain: 'coder-dojo-platform'
});

dust.helpers.i18n = function (chunk, context, bodies, params) {
  var defaultLanguage = 'en_US';

  //get the current language from context
  var locale = (context.stack && context.stack.head && context.stack.head.context && context.stack.head.context.locality)
      || (context.stack && context.stack.tail && context.stack.tail.head && context.stack.tail.head.context && context.stack.tail.head.context.locality)
      || (context.stack && context.stack.tail && context.stack.tail.tail && context.stack.tail.tail.head && context.stack.tail.tail.head.context && context.stack.tail.tail.head.context.locality)
      || defaultLanguage;

  var translation = i18nHelper.getClosestTranslation(locale, params.key);
  if (translation) {
    if (params.context) {
      translation = translation.withContext(params.context);
    }
    translation = params.count
      ? translation.ifPlural(params.count, params.key).fetch(params.count)
      : translation.fetch();
  } else {
    // console.log('Missing translation', params.key); // Uncomment this to track down missing messages.po entries used in templates
    translation = params.key;
  }

  return chunk.write(translation);
};
