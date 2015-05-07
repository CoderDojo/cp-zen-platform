'use strict';

module.exports = function (router) {
  router.get('/template/*', function (req, res) {
    res.render('champion/' + req.params[0]);
  });
};