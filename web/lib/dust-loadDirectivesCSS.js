'use strict';

var glob = require('glob');
var path = require('path');
var dust = require('dustjs-linkedin');
var _ = require('lodash');

/**
 * Hapi-less doesn't support globbing
 * So we inject every directives CSS when on debug
 * elsewhat it's done by gulp globbing on prod°
 */
dust.helpers.loadDirectivesCSS = function (chunk, context, bodies, params) {
  var base = path.join(__dirname, '../public/js/directives');
  var htmlFiles = [];
  if (process.env.UIDEBUG === 'true') {
    var files = glob.sync( '**/*.less', {cwd: base });
    console.log(files);
    _.each(files, function(file){
      console.log(file);
      file = file.replace('.less', '.css');
      var html = '<link href="/dist/css/directives/' + file + '" rel="stylesheet">';
      console.log(html);
      htmlFiles.push(html);
    });
    return chunk.write(htmlFiles.join('\n'));
  }
};
