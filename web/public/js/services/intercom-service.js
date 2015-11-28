'use strict';

angular.module('cpZenPlatform').factory('intercomService', function ($localStorage, $window, cdUsersService, alertService, auth) {

  var intercomService = {};
  var userType = '';

  function userIsNinja(user) {
    return userType === 'attendee-o13' || userType === 'attendee-u13';
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
      user_type: userType,
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
        var initUserTypeStr = JSON.parse(user.initUserType);
        userType = initUserTypeStr.name;
        if(!userIsNinja(user)){
          bootIntercom(null, user);
        }
      }
    });
  };

  return intercomService;
});
