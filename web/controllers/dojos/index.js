'use strict';

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

  router.get('/template/edit-dojo', function (req, res) {
    res.render('dojos/create-dojo');
  });

  router.get('/template/dojo-detail', function (req, res) {
    res.render('dojos/dojo-detail');
  });

  router.get('/template/dojo-list-index', function (req, res) {
    res.render('dojos/dojo-list-index');
  });

  router.get('/template/manage-dojos', function (req, res){
    res.render('dojos/manage-dojos');
  });

  router.get('/template/stats', function(req, res){
    res.render('dojos/stats');
  });
};