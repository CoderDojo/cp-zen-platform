;(function() {
  'use strict';
  
angular
    .module('cpZenPlatform')
    .component('cdExpandingDojoCard', {
      bindings: {
        dojo: '<',
        user: '<',
        startExpanded: '@'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-expanding-dojo-card',
      controller: ['cdDojoService', 'dojoUtils', function (cdDojoService, dojoUtils) {
        var ctrl = this;
        var dojo = ctrl.dojo;
        var user = ctrl.user;
        var address = [];
        var usersDojosQuery = {userId: user.id, dojoId: dojo.id, deleted: 0};
        if (dojo.address1) {
          address.push(dojo.address1);
        }
        if (dojo.address2) {
          address.push(dojo.address2);
        }
        if (dojo.placeName) {
          address.push(dojo.placeName);
        }
        if (dojo.countryName) {
          address.push(dojo.countryName)
        }
        ctrl.address = address.join(', ');
        cdDojoService.getAvatar(dojo.id)
          .then(function(avatarUrl) {
            ctrl.dojoImage = avatarUrl;
          });
        cdDojoService.getUsersDojos(usersDojosQuery)
          .then(function (usersDojos) {
            dojoUtils.isHavingPerm(user, dojo.id, 'dojo-admin', usersDojos.data[0])
              .then(function(isDojoAdmin) {
                ctrl.isDojoAdmin = isDojoAdmin;
              });
            dojoUtils.isHavingPerm(user, dojo.id, 'ticketing-admin', usersDojos.data[0])
              .then(function(isTicketingAdmin) {
                ctrl.isTicketingAdmin = isTicketingAdmin;
              });
          });
      }]
    });
}());
