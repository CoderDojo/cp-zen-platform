const dust = require('dustjs-linkedin');
const _ = require('lodash');

module.exports = () => {
  dust.helpers.setMeta = (chunk, { stack }) => {
    let metas = '';
    const applyMeta = (value, key) => {
      if (_.isString(value)) {
        metas += `<meta property="og:${key}" content="${value}"/>`;
      } else {
        _.each(value, (arrValue) => {
          metas += `<meta property="og:${key}" content="${arrValue}"/>`;
        });
      }
    };

    if (stack.head.context.preload) {
      _.each(stack.head.context.preload, applyMeta);
    }
    return chunk.write(metas);
  };
};
