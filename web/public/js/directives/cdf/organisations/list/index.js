;(function() {
  'use strict';

var cdfOrgList = {
  restrict: 'E',
  bindings: {
  },
  templateUrl: '/directives/tpl/cdf/organisations/list',
  controller: ['cdOrganisationsService', 'atomicNotifyService', function (cdOrganisationsService, atomicNotifyService) {
    var cdfOL = this;
    cdfOL.$onInit = function () {
      reload();
    };
    cdfOL.save = function () {
      cdOrganisationsService.create(cdfOL.org)
      .then(function () {
        return reload();
      })
      .then(function () {
        atomicNotifyService.info('Org saved');
      });
    };

    function reload () {
      return cdOrganisationsService.list()
        .then(function (orgs) {
          cdfOL.orgs = orgs.data;
      });
    }

  }],
  controllerAs: 'cdfOL'
};

angular
  .module('cpZenPlatform')
  .component('cdfOrgList', cdfOrgList);
}());
