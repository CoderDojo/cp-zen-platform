;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdLms', function () {
      return {  restrict: 'AE',
        templateUrl: '/directives/tpl/lms',
        controller: ['$scope', 'auth', 'cdDojoService', 'cdLMSService', 'cdUsersService',
         '$window', '$translate', 'alertService',
        function ($scope, auth, cdDojoService, cdLMSService, cdUsersService,
          $window, $translate, alertService) {
          $scope.allowed = false;
          var user = {};
          var userTypes = [];
          $scope.lmsVisibility = false;

          $scope.getVisibility = function () {
            return $scope.lmsVisibility;
          }

          auth.get_loggedin_user( function (authUser) {
            user = authUser;
            if(user){
              async.waterfall([
                getUserProfile,
                getUserTypes
              ]);
            }
          });

          var getUserProfile = function (cb) {
            cdUsersService.loadUserProfile(user.id, function (profile) {
              userTypes.push(profile.userType);
              cb();
            });
          };

          //  Verify the user is allowed to access
          var getUserTypes = function (cb) {
            cdDojoService.getUsersDojos({userId: user.id}, function (userDojos) {
              if (!_.isEmpty(userDojos)) {
                _.each(userDojos, function (userDojo) {
                  userTypes = _.union(userDojo.userTypes, userTypes);
                });
              }
              var allowed = ['champion', 'mentor', 'parent-guardian'];
              if ((_.intersection(allowed, userTypes)).length > 0) {
                $scope.lmsVisibility = true;
                cb();
              }
              return;
            });
          };

          $scope.getLoginURL = function () {
            cdLMSService.getLoginURL({approval: true}, callback, cbErr);

            function callback (link) {
              if (link.url) {
                $window.location.href = link.url;
              }
            }

            function cbErr (err) {
              if (err.data && err.data.why) alertService.showError($translate.instant(err.data.why));
            }
          };
        }]
      };
    });
}());
