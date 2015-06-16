'use strict';

module.exports = function (router) {
  router.get('/template/*', function (req, res) {
    // set the session user to what seneca thinks it is
    if(req.seneca.user){
      req.session.senecaUser = req.seneca.user;
    }
    res.render('dojos/' + req.params[0]);
  });
};