'use strict';

var path = require('path');
var glob = require('glob');
var dust = require('dustjs-linkedin');
var _ = require('lodash');
var scripts = ['/dist/dependencies.js', '/dist/app.js'];
var cdfScripts = ['/dist/dependencies.js', '/dist/cdf-app.js'];

if (process.env.UIDEBUG === 'true') {
  var deps = require('../public/dependencies.json');
  scripts = cdfScripts = [];
  var appGlobs = require('../public/app.json');
  var cdfAppGlobs = require('../public/cdf-app.json');
  scripts = preparePaths(deps, appGlobs);
  var cloneAppGlobs = appGlobs.slice(0);
  cloneAppGlobs = cloneAppGlobs.concat(cdfAppGlobs);
  for (var appIndex in cloneAppGlobs) {
    if (cloneAppGlobs[appIndex].indexOf('init-master') > -1) {
      cloneAppGlobs.splice(appIndex, 1);
    }
  }
  cdfScripts = preparePaths(deps, cloneAppGlobs);
}

function preparePaths (deps, globs) {
  var localScripts = [];
  for (var i = 0; i < globs.length; i++) {
    var files = glob.sync(path.join(__dirname, '../../', globs[i]));
    for (var j = 0; j < files.length; j++) {
      // lodash _.uniq seems to make it goes bollocks
      var duplicateIndex = localScripts.indexOf(files[j]);
      if (duplicateIndex === -1) {
        localScripts.push(files[j]);
      }
    }
  }
  localScripts = deps.concat(localScripts);
  for (var y = 0; y < localScripts.length; y++) {
    localScripts[y] = localScripts[y].replace(/.*\/public\//, '/'); // Remove up to and incl. public from the path
  }
  return localScripts;
}

dust.helpers.loadJS = function (chunk, context, bodies, params) {
  var scriptTags = '';
  var conf;
  var js = 'window.zenConf = {};';
  if (process.env.NODE_ENV === 'production'){
    conf = require('../config/web-production.js');
  } else if (process.env.NODE_ENV === 'staging') {
    conf = require('../config/web-staging.js');
  } else {
    conf = require('../config/web-development.js');
  }
  for (var variable in conf) {
    js += 'window.zenConf.' + variable + ' = \'' + conf[variable] +'\';';
  }
  scriptTags = '<script>' + js + '</script>';
  var localScripts = params.src.indexOf('cdf') > -1 ? cdfScripts: scripts;
  for (var i = 0; i < localScripts.length; i++) {
    scriptTags += '<script src="' + localScripts[i] + '"></script>';
  }
  return chunk.write(scriptTags);
};
