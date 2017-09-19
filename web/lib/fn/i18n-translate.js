const I18NHelper = require('cp-i18n-lib');
const CpTranslations = require('cp-translations');

const i18nHelper = new I18NHelper({
  poFilePath: CpTranslations.getPoFilePath(),
  poFileName: 'messages.po',
  domain: 'coder-dojo-platform',
});

module.exports = (locale, params) => {
  let translation = i18nHelper.getClosestTranslation(locale, params.key);
  if (translation) {
    if (params.context) {
      translation = translation.withContext(params.context);
    }
    const translated = params.var ? translation.fetch(params.var) : translation.fetch();
    translation = params.count
      ? translation.ifPlural(params.count, params.key).fetch(params.count)
      : translated;
  } else {
    // Uncomment this to track down missing messages.po entries used in templates
    // console.log('Missing translation', params.key);
    translation = params.key;
  }
  return translation;
};
