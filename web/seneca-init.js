'use strict';

var seneca = require('./index'); // TODO better way to share seneca instance?

seneca.ready(function(){
  console.log('seneca ready');
});

module.exports = function(){
  return seneca.export('web');
};
