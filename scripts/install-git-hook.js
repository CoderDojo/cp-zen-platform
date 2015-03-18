'use strict';

var fs = require('fs-extra');
var path = require('path');

var githooks = path.join(__dirname, '../.git/hooks/pre-commit');
var hooks = path.join(__dirname, '../pre-commit');

fs.copySync(hooks, githooks);

fs.chmodSync(githooks, '755');

