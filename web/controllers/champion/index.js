'use strict';

module.exports = function (router) {
  router.get('/template/create', function (req, res) {
    res.render('champion/create');
  });
};