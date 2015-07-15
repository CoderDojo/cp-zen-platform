'use strict';

module.exports = function (router) {
  router.get('/template/*', function (req, res) {
     res.render('charter/' + req.params[0]);
   });
};
