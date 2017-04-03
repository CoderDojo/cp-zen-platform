;(function () {
  /*global mailForm, _*/
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdEmailUsers', {
      bindings: {
        users: '<',
        ccUsers: '<',
        dojoId: '<'
      },
      controller: ['usSpinnerService', '$translate', '$rootScope', 'utilsService',
      'cdDojoService', 'alertService', 'atomicNotifyService', '$scope',
      function (usSpinnerService, $translate, $rootScope, utilsService,
        cdDojoService, alertService, atomicNotifyService, $scope) {
        var ctrl = this;
        ctrl.$onInit = function () {
          ctrl.editorOptions = utilsService.getCKEditorConfig();
          ctrl.defaultContent = ctrl.content = $translate.instant('Type the content of your email here');
          ctrl.title = '';
          cdDojoService.load(ctrl.dojoId)
          .then(function (dojo) {
            ctrl.dojo = dojo.data;
          })
          .catch(function (err) {
            alertService.showError($translate.instant('An error has occurred while loading Dojo') + JSON.stringify(err));
          });
        };
        ctrl.update = function () {
          if (ctrl.users) {
            ctrl.parents = _.uniqBy(_.values(ctrl.ccUsers), 'userId');
            //TODO: take into account users without emails, should the "To" field change?
            ctrl.total = ctrl.users.length + ctrl.parents.length;
          }
        };

        ctrl.$onChanges = function () {
          ctrl.update();
        };

        ctrl.removeUser = function (userId) {
          ctrl.users = _.reject(ctrl.users, {userId: userId});
          delete ctrl.ccUsers[userId];
          ctrl.update();
        };

        ctrl.sendEmail = function () {
          usSpinnerService.spin('manage-dojo-users-spinner');
          ctrl.payload = {
            userIds: _.map(ctrl.users, 'userId'),
            data: {
              subject: ctrl.title,
              content: ctrl.content
            }
          };
          cdDojoService.sendEmail(ctrl.dojo.id, ctrl.payload)
          .then(function () {
            ctrl.title = '';
            ctrl.content = ctrl.defaultContent;
            mailForm.mailForm.reset();
            usSpinnerService.stop('manage-dojo-users-spinner');
            atomicNotifyService.success($translate.instant('Email sent!'), 5000);
            $rootScope.$emit('emailSent');
          })
          .catch(function () {
            usSpinnerService.stop('manage-dojo-users-spinner');
            alertService.showError($translate.instant('An error has occurred while sending the email'));
          });
        };
      }],
      templateUrl: '/directives/tpl/cd-email-users'
    });
}());
