'use strict';

var seneca = require('./index'); 

seneca.ready(function(){
  console.log('seneca ready');
});

module.exports = function(){
  return seneca.export('web');
};
