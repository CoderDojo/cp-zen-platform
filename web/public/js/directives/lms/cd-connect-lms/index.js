;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdConnectLms', function () {
      return {  restrict: 'AE',
        template: '<div class="panel panel-default" ng-show="getVisibility()">'+
        '<button ng-click="getLoginURL()" class="btn btn-default btn-block">{{ lmsLink }}</button>'+
        '</div>',
        controller: ['$scope', 'auth', 'cdDojoService', 'cdLMSService', 'cdUsersService',
         '$window', '$translate', 'alertService',
        function ($scope, auth, cdDojoService, cdLMSService, cdUsersService,
          $window, $translate, alertService) {
          $scope.allowed = false;
          var user = {};
          var userTypes = [];
          $scope.lmsLink = $translate.instant('Access our e-learning module');
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
                  userTypes = _.union(userDojo.userType, userTypes);
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
            cdLMSService.getLoginURL({}, callback, cbErr);

            function callback (link) {
              if (link.approvalRequired) {
                alertService.confirm(
                  $translate.instant('By using this functionality, you allow us to share basic information with this provider (email, name, user type)') +
                    '\n'+ $translate.instant('Do you agree?'),
                  function (response) {
                    if (response === true) {
                      cdLMSService.getLoginURL({approval: true}, callback);
                    }
                });
              } else if (link.url) {
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
