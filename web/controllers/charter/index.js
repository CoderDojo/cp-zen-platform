'use strict';

module.exports = function (router) {
  /*router.get('/', function (req, res) {
    res.render('charter/index');
  });*/
  router.get('/template/index', function (req, res) {
    res.render('charter/index');
  });
};
