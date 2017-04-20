;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdExpandingDojoCardUsers', {
      bindings: {
        dojo: '<'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-expanding-dojo-card/cd-expanding-dojo-card-users',
      controller: ['cdDojoService', '$q', function(cdDojoService, $q) {
        var ctrl = this;
        getUsersDojos();

        function getUsersDojos() {
          return cdDojoService.getUsersDojos({
            dojoId: ctrl.dojo.id,
            deleted: 0
          }).then(function (usersDojos) {
            ctrl.usersDojos = usersDojos.data;
            return $q.resolve();
          });
        }
      }]       
    });
}());
