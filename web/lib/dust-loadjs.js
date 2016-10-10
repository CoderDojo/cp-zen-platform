'use strict';

var path = require('path');
var glob = require('glob');
var dust = require('dustjs-linkedin');
var scripts = ['/dist/dependencies.js', '/dist/app.js'];
if (process.env.UIDEBUG === 'true') {
  scripts = require('../public/dependencies.json');
  var appGlobs = require('../public/app.json');
  for (var i = 0; i < appGlobs.length; i++) {
    var files = glob.sync(path.join(__dirname, '../../', appGlobs[i]));
    for (var j = 0; j < files.length; j++) {
      scripts.push(files[j]);
    }
  }
  for (var i = 0; i < scripts.length; i++) {
    scripts[i] = scripts[i].replace(/.*\/public\//, '/'); // Remove up to and incl. public from the path
  }
}

dust.helpers.loadJS = function (chunk, context, bodies, params) {
  var scriptTags = '';
  var conf;
  var js = 'window.zenConf = {};';
  if (process.env.NODE_ENV === 'production'){
    conf = require('../config/web-production.js');
  } else {
    conf = require('../config/web-development.js');
  }
  for (var variable in conf) {
    js += 'window.zenConf.' + variable + ' = \'' + conf[variable] +'\';';
  }
  scriptTags = '<script>' + js + '</script>';
  for (var i = 0; i < scripts.length; i++) {
    scriptTags += '<script src="' + scripts[i] + '"></script>';
  }
  return chunk.write(scriptTags);
};
