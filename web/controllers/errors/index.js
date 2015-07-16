'use strict';

module.exports = function (router) {
  router.get('/template/*', function (req, res) {
    res.render('errors/' + req.params[0]);
  });
};
