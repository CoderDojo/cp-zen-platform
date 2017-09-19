const path = require('path');
const glob = require('glob');
const dust = require('dustjs-linkedin');
const deps = require('../public/dependencies.json');
const appGlobs = require('../public/app.json');
const cdfAppGlobs = require('../public/cdf-app.json');
const prod = require('../config/web-production.js');
const staging = require('../config/web-staging.js');
const dev = require('../config/web-development.js');

let scripts = ['/dist/dependencies.js', '/dist/app.js'];
let cdfScripts = ['/dist/dependencies.js', '/dist/cdf-app.js'];

module.exports = () => {
  if (process.env.UIDEBUG === 'true') {
    scripts = [];
    cdfScripts = [];
    scripts = preparePaths(deps, appGlobs);
    let cloneAppGlobs = appGlobs.slice(0);
    cloneAppGlobs = cloneAppGlobs.concat(cdfAppGlobs);
    cloneAppGlobs.forEach((appGlob, index) => {
      if (appGlob.indexOf('init-master') > -1) {
        cloneAppGlobs.splice(index, 1);
      }
    });
    cdfScripts = preparePaths(deps, cloneAppGlobs);
  }

  dust.helpers.loadJS = (chunk, context, bodies, { src }) => {
    let js = '';
    let conf;
    if (process.env.NODE_ENV === 'production') {
      conf = prod;
    } else if (process.env.NODE_ENV === 'staging') {
      conf = staging;
    } else {
      conf = dev;
    }
    Object.entries(conf).forEach(([key, variable]) => {
      js += `window.zenConf.${key} = '${variable}';`;
    });
    let scriptTags = `<script>window.zenConf={};${js}</script>`;
    const localScripts = src.indexOf('cdf') > -1 ? cdfScripts : scripts;
    localScripts.forEach((script) => {
      scriptTags += `<script src="${script}"></script>`;
    });
    return chunk.write(scriptTags);
  };
};

function preparePaths(depsArg, globs) {
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
  localScripts = depsArg.concat(localScripts);
  for (let y = 0; y < localScripts.length; y += 1) {
    localScripts[y] = localScripts[y].replace(/.*\/public\//, '/'); // Remove up to and incl. public from the path
  }
  return localScripts;
}
