;(function () {
  /*global mailForm, _*/
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdEmailUsersList', {
      bindings: {
        users: '<',
        removeUser: '&?'
      },
      controller: [ function () {
        var ctrl = this;
      }],
      templateUrl: '/directives/tpl/cd-email-users/user-list'
    });
}());
