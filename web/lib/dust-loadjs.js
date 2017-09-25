

const path = require('path');
const glob = require('glob');
const dust = require('dustjs-linkedin');

let scripts = ['/dist/dependencies.js', '/dist/app.js'];
let cdfScripts = ['/dist/dependencies.js', '/dist/cdf-app.js'];
// UIDEBUG === true
const deps = require('../public/dependencies.json');
const appGlobs = require('../public/app.json');
const cdfAppGlobs = require('../public/cdf-app.json');

const confs = {};
confs.production = require('../config/web-production.js');
confs.staging = require('../config/web-staging.js');
confs.development = require('../config/web-development.js');


function preparePaths(globs) {
  let localScripts = [];
  for (let i = 0; i < globs.length; i += 1) {
    const files = glob.sync(path.join(__dirname, '../../', globs[i]));
    for (let j = 0; j < files.length; j += 1) {
      // lodash _.uniq seems to make it goes bollocks
      const duplicateIndex = localScripts.indexOf(files[j]);
      if (duplicateIndex === -1) {
        localScripts.push(files[j]);
      }
    }
  }
  localScripts = deps.concat(localScripts);
  for (let y = 0; y < localScripts.length; y += 1) {
    localScripts[y] = localScripts[y].replace(/.*\/public\//, '/'); // Remove up to and incl. public from the path
  }
  return localScripts;
}

if (process.env.UIDEBUG === 'true') {
  cdfScripts = [];
  scripts = [];
  scripts = preparePaths(appGlobs);
  let cloneAppGlobs = appGlobs.slice(0);
  cloneAppGlobs = cloneAppGlobs.concat(cdfAppGlobs);
  for (const appIndex in cloneAppGlobs) { // eslint-disable-line no-restricted-syntax
    if (cloneAppGlobs[appIndex].indexOf('init-master') > -1) {
      cloneAppGlobs.splice(appIndex, 1);
    }
  }
  cdfScripts = preparePaths(cloneAppGlobs);
}

dust.helpers.loadJS = function (chunk, context, bodies, params) {
  let scriptTags = '';
  let conf;
  let js = 'window.zenConf = {};';
  if (process.env.NODE_ENV === 'production') {
    conf = confs.production;
  } else if (process.env.NODE_ENV === 'staging') {
    conf = confs.staging;
  } else {
    conf = confs.development;
  }
  // eslint-disable-next-line guard-for-in
  for (const variable in conf) { // eslint-disable-line no-restricted-syntax
    js += `window.zenConf.${variable} = '${conf[variable]}';`;
  }
  scriptTags = `<script>${js}</script>`;
  const localScripts = params.src.indexOf('cdf') > -1 ? cdfScripts : scripts;
  for (let i = 0; i < localScripts.length; i += 1) {
    scriptTags += `<script src="${localScripts[i]}"></script>`;
  }
  return chunk.write(scriptTags);
};
