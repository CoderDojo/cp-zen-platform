const dust = require('dustjs-linkedin');
const translater = require('./fn/i18n-translate');

dust.helpers.i18n = function(chunk, context, bodies, params) {
  const defaultLanguage = 'en_US';

  // get the current language from context
  // TODO : implement log for deprecation to understand in which scenario
  // which value is picked : this is unclear
  const locale =
    (context.stack &&
      context.stack.head &&
      context.stack.head.context &&
      context.stack.head.context.locality) ||
    (context.stack &&
      context.stack.tail &&
      context.stack.tail.head &&
      context.stack.tail.head.context &&
      context.stack.tail.head.context.locality) ||
    (context.stack &&
      context.stack.tail &&
      context.stack.tail.tail &&
      context.stack.tail.tail.head &&
      context.stack.tail.tail.head.context &&
      context.stack.tail.tail.head.context.locality) ||
    defaultLanguage;

  const translation = translater(locale, params);

  return chunk.write(translation);
};
module.exports = dust.helpers.i18n;
