'use strict';
//TO DO:update res.render to one dojos folder
module.exports = function (router) {
  router.get('/template/dojo-list', function (req, res) {
    res.render('dojos/dojo-list');
  });

  router.get('/template/my-dojos', function (req, res) {
    res.render('dojos/my-dojos');
  });

  router.get('/template/create-dojo', function (req, res) {
    res.render('dojos/create-dojo');
  });
};