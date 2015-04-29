'use strict';

module.exports = function (router) {
  router.get('/template/*', function(req, res) {
    res.render('dojos/' + req.params[0]);
  });
};