;(function() {
  'use strict';

  angular.module('cpZenPlatform').component('cdUserActions', {
    bindings: {
      canEdit: '=',
      user: '='
    },
    restrict: 'EA',
    templateUrl: '/directives/tpl/user/user-actions',
    controllerAs: 'cdUA'
  });

}());
