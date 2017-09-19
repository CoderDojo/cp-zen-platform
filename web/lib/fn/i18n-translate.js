'use strict';

var I18NHelper = require('cp-i18n-lib');
var CpTranslations = require('cp-translations');
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
    translation = params.count // eslint-disable-line no-nested-ternary
      ? translation.ifPlural(params.count, params.key).fetch(params.count)
      : params.var ? translation.fetch(params.var) : translation.fetch();
  } else {
    // Uncomment this to track down missing messages.po entries used in templates
    // console.log('Missing translation', params.key);
    translation = params.key;
  }
  return translation;
};
