'use strict';

angular.module('cpZenPlatform').factory('intercomService', function ($localStorage, $window, cdUsersService, alertService, auth) {

  var intercomService = {};

  function userIsCDFAdmin(user) {
    return _.contains(user.roles, 'cdf-admin');
  }

  function userIsChampion(user, cb) {
    cdUsersService.isChampion(user.id, cb,
      function (err) {
        alertService.showError(
          'An error has occurred while checking user: <br /> ' +
          (err.error || JSON.stringify(err))
        );

        return cb(err);
      })
  }

  function bootIntercom(dojos, user) {
    var dojoIds = null;
    $localStorage.dojoIds = null;

    if (dojos) {
      dojoIds = _.pluck(dojos.records, 'id').toString();
      $localStorage.dojoIds = dojoIds;
    }

    var userData = {
      name: user.name,
      email: user.email,
      created_at: moment().unix(),
      app_id: "x7bz1cqn",
      user_id: user.id,
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
    auth.get_loggedin_user(function (user) {
      if (user) {
        if (userIsCDFAdmin(user)) {
          bootIntercom(null, user);
        } else {
          userIsChampion(user, function (res) {
            if (res.isChampion) {
              bootIntercom(res.dojos, user);
            }
          })
        }
      }
    });
  };

  return intercomService;
});
