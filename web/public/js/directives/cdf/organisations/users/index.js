;(function() {
  'use strict';

var cdfOrgUserList = {
  restrict: 'E',
  bindings: {
  },
  templateUrl: '/directives/tpl/cdf/organisations/users',
  controller: ['cdOrganisationsService', '$state', 'atomicNotifyService',
  function (cdOrganisationsService, $state, atomicNotifyService) {
    var cdfOUL = this;
    cdfOUL.$onInit = function () {
      cdfOUL.orgId = $state.params.orgId;
      cdOrganisationsService.load(cdfOUL.orgId)
      .then(function (org) {
        cdfOUL.orgName = org.data.name;
      });
      reload();
    };
    cdfOUL.save = function () {
      cdOrganisationsService.createUser(cdfOUL.orgId, cdfOUL.userId)
      .then(function () {
        return reload();
      })
      .then(function () {
        atomicNotifyService.info('User is now a member of the group');
      });
    };
    cdfOUL.delete = function (userId) {
      cdOrganisationsService.deleteUser(cdfOUL.orgId, userId)
      .then(function () {
        return reload();
      })
      .then(function () {
        atomicNotifyService.info('User has been removed from the group');
      });
    };
    function reload () {
      return cdOrganisationsService.loadOrgUsers(cdfOUL.orgId)
      .then(function (users) {
        cdfOUL.users = users.data;
      });
    }
  }],
  controllerAs: 'cdfOUL'
};

angular
  .module('cpZenPlatform')
  .component('cdfOrgUserList', cdfOrgUserList);
}());
