'use strict';

module.exports = function (router) {
  router.get('/template/index', function (req, res) {
    res.render('dojo-list/index');
  });
};
