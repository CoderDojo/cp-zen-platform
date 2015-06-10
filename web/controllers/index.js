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

  router.get('/terms-and-conditions', function (req, res) {
    res.render('index');
  });

  router.get('/dojo/:alpha2([a-zA-Z]{2})/*', function (req, res) {
    res.render('index');
  });

  router.get('/dojo/:id', function (req, res) {
    res.render('dashboard/index');
  });

  router.get('/accept_dojo_user_invitation/:dojoId/:userInviteToken', function (req, res) {
    res.render('index');
  });

  router.get('/accept_dojo_user_request/:userId/:userInviteToken', function(req, res) {
    res.render('index');
  });

  router.get('/profile/:userId', function (req, res) {
    res.render('index');
  }); 

  router.get('/templates/login', function (req, res) {
    res.render('accounts/login');
  });

  router.get('/templates/register', function (req, res) {
    res.render('accounts/register');
  });

  router.get('/templates/terms-and-conditions', function (req, res) {
    res.render('accounts/terms-and-conditions');
  });

};
