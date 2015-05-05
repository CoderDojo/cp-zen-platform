'use strict';

module.exports = function (router) {

  router.get('/', function (req, res) {
    res.render('index');
  });

  router.get('/login', function (req, res) {
    res.render('index');
  });

  router.get('/register', function (req, res) {
    res.render('index');
  });

  router.get('/create-dojo', function (req, res) {
    res.render('index');
  });

  router.get('/start-dojo', function (req, res) {
    res.render('index');
  });

  router.get('/dojo-list-index', function (req, res) {
    res.render('index');
  });

  router.get('/dojo/:alpha2([a-zA-Z]{2})/*', function (req, res) {
    res.render('dashboard/index');
  });

  router.get('/dojo/:id', function (req, res) {
    res.render('dashboard/index');
  });

  router.get('/templates/login', function (req, res) {
    res.render('accounts/login');
  });

  router.get('/templates/register', function (req, res) {
    res.render('accounts/register');
  });

};
