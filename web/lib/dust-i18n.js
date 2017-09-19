const dust = require('dustjs-linkedin');
const translater = require('./fn/i18n-translate');

module.exports = () => {
  dust.helpers.i18n = (chunk, { stack }, bodies, params) => {
    const defaultLanguage = 'en_US';

    // get the current language from context
    const headLocale = stack && stack.head && stack.head.context && stack.head.context.locality;
    const tailLocale =
      stack &&
      stack.tail &&
      stack.tail.head &&
      stack.tail.head.context &&
      stack.tail.head.context.locality;
    const tailTailLocale =
      stack &&
      stack.tail &&
      stack.tail.tail &&
      stack.tail.tail.head &&
      stack.tail.tail.head.context &&
      stack.tail.tail.head.context.locality;
    const locale = headLocale || tailLocale || tailTailLocale || defaultLanguage;
    const translation = translater(locale, params);
    return chunk.write(translation);
  };
};
