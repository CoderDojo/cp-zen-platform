'use strict';

var _ = require('lodash');
var path = require('path');
var glob = require('glob');

var config = {};

var dir = path.resolve(__dirname);

var files = glob.sync("*.js", {cwd: dir});
_.chain(files)
  .reject(function (file) { return /index\.js$/.test(file); })
  .each(function (file) {
    _.extend(config, require(path.join(dir, file)));
  });

module.exports = config;
