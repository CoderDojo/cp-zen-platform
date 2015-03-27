'use strict';

module.exports = function (router) {
  router.get('/:id', function (req, res) {
    res.render('create-dojo/index');
  });
};
