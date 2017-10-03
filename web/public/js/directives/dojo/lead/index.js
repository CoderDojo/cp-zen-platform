'use strict';
angular
  .module('cpZenPlatform')
  .component('cdDojoLead', {
    bindings: {
      id: '<'
    },
    restrict: 'EA',
    templateUrl: '/directives/tpl/dojo/lead',
    controller: ['cdDojoService', 'utilsService', 'cdUsersService', 'userUtils',
    '$http', 'dojoUtils', 'cdAgreementsService', '$q', 'atomicNotifyService', '$state',
    function (cdDojoService, utilsService, cdUsersService, userUtils,
      $http, dojoUtils, cdAgreementsService, $q, atomicNotifyService, $state) {
      var ctrl = this;
      ctrl.days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      ctrl.getReferenceValue = function (id) {
        return _.find(dojoUtils.startingDojoSrcs, {'id': id}).name;
      };
      ctrl.verify = function () {
        cdDojoService.verify(ctrl.dojo.id, 1)
        .then(function (res) {
          _.assign(ctrl.dojo, res.data);
          atomicNotifyService.info('Verified !', 1000);
        })
        .catch(function (err) {
          atomicNotifyService.error('Oops : ' + err, 3000);
        });
      };
      function getDojo () {
        if (ctrl.lead.application.dojo) {
          return cdDojoService.load(ctrl.lead.application.dojo.id)
          .then(function (res) {
            ctrl.dojo = res.data;
          })
          .then(function () {
            return cdDojoService.getAvatar(ctrl.dojo.id)
            .then(function (res) {
              ctrl.dojo.avatar = res.data;
            });
          });
        }
      }
      function getCharter () {
        if (ctrl.lead.application.charter) {
          return cdAgreementsService.load(ctrl.lead.application.charter.id)
          .then(function (res) {
            ctrl.charter = res.data;
          });
        }
      }
      // Get user profile
      function getProfile () {
        return cdUsersService.userProfileData({userId: ctrl.lead.userId})
        .then(function (profile) {
          ctrl.profile = profile.data;
        })
        // Recover dojo participation
        .then(function () {
          ctrl.otherDojos = [];
          var dojos = _.omitBy(ctrl.profile.dojos, function (dojo) { return dojo.id === ctrl.dojo.id; });
          // Lookup previous experience, even if deleted
          if (_.keys(dojos).length) {
            return cdDojoService.getUsersDojos({dojoId: {in$: _.map(dojos, 'id')}, userId: ctrl.lead.userId})
            .then(function (res) {
              var userDojos = res.data;
              var setUserDojoRole = function (dojo) {
                var userDojo = _.find(userDojos, function (uD) { return dojo.id === uD.dojoId; });
                ctrl.otherDojos.push(userDojo.userTypes.join(', ') + ' @ ' + dojo.name);
              };
              _.each(dojos, setUserDojoRole);
            });
          }
        });
      }
      function parseValidity () {
        ctrl.tabs = _.map(ctrl.lead.application, function (step, key) {
          return {name: key, isValid: step.isValid};
        });
      }
      ctrl.$onInit = function () {
        cdDojoService.loadDojoLead(ctrl.id)
        .then(function (response) {
          ctrl.lead = response.data;
          ctrl.champion = ctrl.lead.application.champion;
          ctrl.champion.age = userUtils.getAge(ctrl.champion.dob);
        })
        .catch(function () {
          $state.go('error-404-no-headers');
        })
        .then(function () {
          return $q.all([
            getDojo(),
            getCharter(),
            getProfile(),
            parseValidity()
          ]);
        });
      };
    }]
  });
