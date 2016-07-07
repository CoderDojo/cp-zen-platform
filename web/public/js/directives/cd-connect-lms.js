;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdConnectLms', function () {
      return {  restrict: 'AE',
        template: '<div class="panel panel-default" ng-show="getVisibility()">'+
        '<button ng-click="getLoginURL()" class="btn btn-default btn-block">{{ lmsLink }}</button>'+
        '</div>',
        controller: ['$scope', 'auth', 'cdDojoService', 'cdLMSService', 'cdUsersService', '$window', '$translate',
        function($scope, auth, cdDojoService, cdLMSService, cdUsersService, $window, $translate) {
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
              var allowed = ['champion', 'mentor'];
              if ((_.intersection(allowed, userTypes)).length > 0) {
                $scope.lmsVisibility = true;
                cb();
              }
              return;
            });
          };

          $scope.getLoginURL = function () {
            cdLMSService.getLoginURL(function (link) {
              $window.location.href = link.url;
            });
          };
        }]
      };
    });
}());
