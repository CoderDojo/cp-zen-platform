;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdExpandingDojoCard', {
      bindings: {
        dojo: '<'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-expanding-dojo-card',
      controller: ['cdDojoService', function (cdDojoService) {
        var ctrl = this;
        var dojo = ctrl.dojo;
        var address = [];
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
          address.push(dojo.countryName);
        }
        ctrl.address = address.join(', ');
        cdDojoService.getAvatar(dojo.id)
          .then(function(avatarUrl){
            ctrl.dojoImage = avatarUrl;
          });
      }]
    });
}());
