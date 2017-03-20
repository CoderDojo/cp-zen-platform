;(function () {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdEmailUsers', {
      bindings: {
        users: '<',
        dojoId: '<'
      },
      controller: ['usSpinnerService', '$translate', '$rootScope', 'utilsService', 'cdDojoService', 'alertService',
      function (usSpinnerService, $translate, $rootScope, utilsService, cdDojoService, alertService) {
        var ctrl = this;
        ctrl.editorOptions = utilsService.getCKEditorConfig();
        ctrl.content = '';
        ctrl.title = '';
        cdDojoService.load(ctrl.dojoId)
        .then(function (dojo) {
          ctrl.dojo = dojo.data;
        })
        .catch(function (err) {
          alertService.showError($translate.instant('Error while loading Dojo' + JSON.stringify(err)));
        });
        ctrl.update = function () {
          if (ctrl.users) {
            ctrl.email = {
              title: ctrl.title,
              users: ctrl.users,
              content: ctrl.content
            };
            ctrl.parents = _.uniq(_.map(_.pickBy(ctrl.users, 'parent'), 'parent'));
            //TODO: take into account users without emails, should the "To" field change?
            ctrl.total = ctrl.users.length + ctrl.parents.length;
          }
        };
        // NOTE: unused until we allow multiselect of users
        ctrl.$onChanges = function () {
          ctrl.update();
        };
        ctrl.removeUser = function (userId) {
          ctrl.users = _.reject(ctrl.users, {userId: userId});
          ctrl.update();
        };
        ctrl.sendEmail = function () {
          usSpinnerService.start('');
          cdDojoService.sendEmail(ctrl.email)
          .then(function () {
            ctrl.content = '';
            ctrl.title = '';
            usSpinnerService.stop('');
            $rootScope.$emit('emailSent');
          });
        };
      }],
      templateUrl: '/directives/tpl/cd-email-users'
    });
}());
