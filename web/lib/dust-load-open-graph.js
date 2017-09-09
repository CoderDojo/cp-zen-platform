'use strict';

var dust = require('dustjs-linkedin');
var _ = require('lodash');

dust.helpers.setMeta = function (chunk, context, bodies, params) {
  var metas = '';
  var applyMeta = function (value, key) {
    if (_.isString(value)) {
      metas += '<meta property="og:' + key + '" content="' + value + '"/>';
    } else {
      _.each(value, function (arrValue) {
        metas += '<meta property="og:' + key + '" content="' + arrValue + '"/>';
      });
    }
  };

  if (context.stack.head.context && context.stack.head.context.preload) {
    _.each(context.stack.head.context.preload, applyMeta);
  }
  return chunk.write(metas);
};
