
window.util   = require('util');
window.async  = require('async');
window._      = require('lodash');

window.seneca = {
    ng: {
        web: function() {
            return function() {};
        }
    }
};

// for each service, find all functions and stub them
window.stubAll = function(args){
  var map    = args.map,
      sandbox = args.sandbox;

  var services = {},
      stubs    = {};

  _.each(Object.keys(map), function(service_name){

      var _ref_ = map[service_name];
      services[service_name] = _ref_; // same as e.g. services.auth = _auth_
      // console.log('service_name: ' + service_name);

      _.each(Object.keys(_ref_), function(func_name){

          // console.log('\t\tfunc: ' + func_name);
          var field = _ref_[func_name];
          if (typeof field == "function") {

              if (!stubs[service_name]) stubs[service_name] = {};
              if (!stubs[service_name][func_name]) stubs[service_name][func_name] = {};

              stubs[service_name][func_name] = sandbox.stub(services[service_name], func_name);
              stubs[service_name][func_name].yields({});
          } 
      });
  });

  return {services: services, stubs: stubs}
}