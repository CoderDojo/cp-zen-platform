;(function (angular) {
  'use strict';

  function cdAuthService(auth) {
    var loggedUser = null;
    auth.get_loggedin_user(function (user) {
      loggedUser = user;
    });

    this.hasPermission = function(obj) {
      if (loggedUser.roles[0] === 'authoring lead') {
        return true;
      }
      return _.isObject(obj.assignedto) ? obj.assignedto.id === loggedUser.id : obj.assignedto === loggedUser.id;
    };
  }

  function hasRole(auth) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        function toggleView() {
          auth.get_loggedin_user(function (user) {
            var roles = attrs.hasRole.split(',');
            var hasRole = _.contains(roles, user.roles[0]);

            element.toggle(hasRole);
          });
        }

        toggleView();
      }
    };
  }

  function hasPermission(cdAuthService) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var watcher = scope.$watch(attrs.hasPermission, function (obj) {
          element.toggle(obj && cdAuthService.hasPermission(obj));
        }, true);

        element.on('$destroy', watcher);
      }
    };
  }

  angular
    .module('cdAuth', [])
    .service('cdAuthService', ['auth', cdAuthService])
    .directive('hasRole', ['auth', hasRole])
    .directive('hasPermission', ['cdAuthService', hasPermission])
  ;
}.call(window, angular));