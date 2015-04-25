'use strict';

module.exports = function (router) {

  router.get('/', function (req, res) {
    res.render('dashboard/index');
  });

  router.get('/dojo/:alpha2([a-zA-Z]{2})/*', function (req, res) {
    res.render('dashboard/index');
  });

  router.get('/dojo/:id', function (req, res) {
    res.render('dashboard/index');
  });

  router.get('/login', function (req, res) {
    res.render('index');
  });

  router.get('/register', function (req, res) {
    res.render('accounts/register');
  });

};
