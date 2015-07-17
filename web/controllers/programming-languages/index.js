'use strict';

var programmingLanguages = require('../../config/programmingLanguages.js');

module.exports = function(router){
  router.get('/', function (req, res) {
    if(programmingLanguages.length < 1){
      console.log("error");
      return res.status(404).json({ error: 'List is empty'});
    }


    res.send(programmingLanguages);
  });
}