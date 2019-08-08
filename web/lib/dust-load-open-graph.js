const dust = require('dustjs-linkedin');
const _ = require('lodash');

dust.helpers.setMeta = function(chunk, context) {
  let metas = '';
  function applyMeta(value, key) {
    if (_.isString(value)) {
      metas += `<meta property="og:${key}" content="${value}"/>`;
    } else {
      _.each(value, arrValue => {
        metas += `<meta property="og:${key}" content="${arrValue}"/>`;
      });
    }
  }

  if (context.stack.head.context && context.stack.head.context.preload) {
    _.each(context.stack.head.context.preload, applyMeta);
  }
  return chunk.write(metas);
};
module.exports = dust.helpers.setMeta;
