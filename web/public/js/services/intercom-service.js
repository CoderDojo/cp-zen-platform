'use strict';

angular.module('cpZenPlatform').factory('intercomService', function ($rootScope, $localStorage, $window, cdUsersService, alertService) {

  var intercomService = {};

  function userIsCDFAdmin() {
    return _.contains($rootScope.user.roles, 'cdf-admin');
  }

  function userIsChampion(cb) {
    cdUsersService.isChampion($rootScope.user.id, cb,
      function (err) {
        alertService.showError(
          'An error has occurred while checking user: <br /> ' +
          (err.error || JSON.stringify(err))
        );

        return cb(err);
      })
  }

  function bootIntercom(dojos) {
    var dojoIds = null;
    $localStorage.dojoIds = null;

    if (dojos) {
      dojoIds = _.pluck(dojos.records, 'id').toString();
      $localStorage.dojoIds = dojoIds;
    }

    var userData = {
      name: $rootScope.user.name,
      email: $rootScope.user.email,
      created_at: moment().unix(),
      app_id: "x7bz1cqn",
      user_id: $rootScope.user.id,
      widget: {
        activator: "#IntercomDefaultWidget"
      },
      dojos: dojoIds
    };

    $window.Intercom('boot', userData);
  }

  intercomService.updateIntercom = function (dojoId) {
    if(!$localStorage.dojoIds){
      $localStorage.dojoIds = '';
    }

    $localStorage.dojoIds = $localStorage.dojoIds.concat(',', dojoId);
    $window.Intercom('update', {"dojos": $localStorage.dojoIds});
  }

  intercomService.shutDown = function () {
    $window.Intercom('shutdown');
  }

  intercomService.InitIntercom = function () {
    if ($rootScope.user) {
      if (userIsCDFAdmin()) {
        bootIntercom();
      } else {
        userIsChampion(function (res) {
          if (res.isChampion) {
            bootIntercom(res.dojos);
          }
        })
      }
    }
  };

  return intercomService;
});
