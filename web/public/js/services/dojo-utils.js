'use strict';

angular.module('cpZenPlatform').factory('dojoUtils', ['$location', '$translate', '$state', '$rootScope',
  'cdDojoService', 'cdUsersService', 'auth', 'usSpinnerService', 'alertService', '$q',
  function($location, $translate, $state, $rootScope,
    cdDojoService, cdUsersService, auth, usSpinnerService, alertService, $q){
  var dojoUtils = {};

  var approvalRequired = ['mentor', 'champion'];

  dojoUtils.requestToJoin = function (requestInvite, dojoId) {
    if(!requestInvite.userType) {
      window.alert('Error');
      return
    } else {
      var userType = requestInvite.userType.name;

      auth.get_loggedin_user(function (user) {
        usSpinnerService.spin('dojo-detail-spinner');
        var data = {user:user, dojoId:dojoId, userType:userType, emailSubject: 'New Request to join your Dojo'};

        //Check if user is already a member of this Dojo
        var query = {userId:user.id, dojoId:dojoId};
        cdDojoService.getUsersDojos(query, function (response) {
          if(_.isEmpty(response)) {
            if(_.includes(approvalRequired, userType)) {
              cdDojoService.requestInvite(data, function (response) {
                usSpinnerService.stop('dojo-detail-spinner');
                if(!response.error) {
                  alertService.showAlert($translate.instant('Join Request Sent'));
                } else {
                  alertService.showError($translate.instant(response.error));
                }
              });
            } else {
              //Save
              var userDojo = {};
              userDojo.owner = 0;
              userDojo.userId = user.id;
              userDojo.dojoId = dojoId;
              userDojo.userTypes = [userType];
              cdDojoService.saveUsersDojos(userDojo, function (response) {
                usSpinnerService.stop('dojo-detail-spinner');
                $state.go($state.current, $state.params, {reload: true});
                alertService.showAlert($translate.instant('Successfully Joined Dojo'));
              });
            }
          }
        });
      }, function () {
        //Not logged in
        $state.go('register-account.require', {referer:$location.url(), userType: userType});
      });
    }
  };

  dojoUtils.getDojoURL = function(dojo) {
    if (dojo) {
      var urlSlug = dojo.url_slug || dojo.urlSlug;
      return "/dojo/" + urlSlug;
    }
  }

  dojoUtils.isHavingPerm = function(user, dojoId, perm, userDojo) {
    function checkUserDojo (userDojo) {
      if (!userDojo || userDojo.length < 1){ return deferred.reject(); }

      var isHavingPerm = _.find(userDojo[0].userPermissions, function (userPermission) {
        return userPermission.name === perm;
      });
      if (!_.isEmpty(isHavingPerm) && !_.isUndefined(isHavingPerm)) {
        deferred.resolve(true);
      } else {
        deferred.reject(false);
      }
    }
    var deferred = $q.defer();
    if (user && !_.isEmpty(user)) {
      var isCDF = _.includes(user.roles, 'cdf-admin');
      var query = {userId: user.id, dojoId: dojoId, deleted: 0};
      var isHavingPerm = _.includes(user.roles, perm);
      if (isHavingPerm || isCDF) {
        deferred.resolve(isHavingPerm || isCDF);
      } else {
        if (userDojo) {
          checkUserDojo([userDojo]);
        } else {
          cdDojoService.getUsersDojos(query, checkUserDojo, function (err) {
            deferred.reject(err);
          });
        }
      }
    } else {
      deferred.reject();
    }
    return deferred.promise;
  };

  dojoUtils.getFrequencyStrings = function () {
    var strings = {};
    strings.frequencies = [
      { id: '1/w',
      name: $translate.instant('Weekly')},
      { id: '2/m',
      name: $translate.instant('Every two weeks')},
      { id: '1/m',
      name: $translate.instant('Monthly')},
      { id: 'other',
      name: $translate.instant('Other')}
    ];
    strings.monthlyFrequencies = [
      {id: '', name: ''},
      {id: 'first', name: $translate.instant('First')},
      {id: '2nd', name: $translate.instant('Second')},
      {id: '3rd', name: $translate.instant('Third')},
      {id: '4th', name: $translate.instant('Fourth')},
      {id: 'last', name: $translate.instant('Last')}
    ];
    // ISO 8601 based, no Sunday as 1
    // We don't use moment data because we want to handle more than the locale,
    // and that would force us to preload the data for day/dates/etc, meaning 2 different processes for the same thing
    strings.days = [
      {id: 1, name: $translate.instant('Monday')},
      {id: 2, name: $translate.instant('Tuesday')},
      {id: 3, name: $translate.instant('Wednesday')},
      {id: 4, name: $translate.instant('Thursday')},
      {id: 5, name: $translate.instant('Friday')},
      {id: 6, name: $translate.instant('Saturday')},
      {id: 7, name: $translate.instant('Sunday')}
    ];
    return strings;
  };

  dojoUtils.startingDojoSrcs = [
    { id: 'search_engine',
      name: $translate.instant('Search Engine')},
    { id: 'volunteers',
      name: $translate.instant('Other CoderDojo Volunteers')},
    { id: 'organisations',
      name: $translate.instant('Other Coding Organisations')},
    { id: 'developpers',
      name: $translate.instant('Development Community')},
    { id: 'events',
      name: $translate.instant('Events')},
    { id: 'word_of_mouth',
      name: $translate.instant('Word of Mouth')},
    { id: 'family',
      name: $translate.instant('Family/Friends')},
    { id: 'media',
      name: $translate.instant('Media (newspaper/radio)')},
    { id: 'other',
      name: $translate.instant('Other')}
  ];
  return dojoUtils;
}]);
