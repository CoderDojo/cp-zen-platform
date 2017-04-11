'use strict';

var path = require('path');
var I18NHelper = require('cp-i18n-lib');
var CpTranslations = require('cp-translations');
var po2json = require('po2json');
var Jed = require('jed');
var fs = require('fs');
var i18nHelper = new I18NHelper({
  poFilePath: CpTranslations.getPoFilePath(),
  poFileName: 'messages.po',
  domain: 'coder-dojo-platform'
});

module.exports = function (locale, params) {
  var translation = i18nHelper.getClosestTranslation(locale, params.key);
  if (translation) {
    if (params.context) {
      translation = translation.withContext(params.context);
    }
    translation = params.count
      ? translation.ifPlural(params.count, params.key).fetch(params.count)
      : params.var ? translation.fetch(params.var) : translation.fetch();
  } else {
    // console.log('Missing translation', params.key); // Uncomment this to track down missing messages.po entries used in templates
    translation = params.key;
  }
  return translation;
};
