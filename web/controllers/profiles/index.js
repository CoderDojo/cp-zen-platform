'use strict';

module.exports = function (router) {
  router.get('/template/*', function (req, res) {
    res.render('profiles/' + req.params[0]);
  });
};