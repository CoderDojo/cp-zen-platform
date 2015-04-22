'use strict';


var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();


    router.get('/', function (req, res) {
        
        
        res.render('dashboard/index', model);
        
        
    });

    router.get('/login', function (req, res) {

        res.render('index', model);

    });

    router.get('/register', function (req, res) {

        res.render('accounts/register', model);

    });
};
