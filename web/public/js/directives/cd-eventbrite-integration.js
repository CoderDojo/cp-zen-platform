;(function() {
  'use strict';

function cdEventbriteIntegration($window, cdEventbriteService, alertService, atomicNotifyService,
  $localStorage, $stateParams, $state, $translate, $rootScope) {
    return {
      restrict: 'E',
      template:
        '<i class="fa fa-spinner" ng-show="saving"></i>' +
        '<div class="row cd-input-row" ng-hide="saving">' +
          '<label class="col-lg-4 cd-form-label1">EventBrite</label>' +
          '<div class="col-lg-8">' +
            '<button type="button" class="btn btn-default" ' +
            'name="dojoEventbrite" id="dojoEventbrite" ' +
            'ng-click="authorizeOAuthEventBrite()">{{eventbriteText}}</button>' +
          '</div>' +
        '</div>',
      controller: function($scope){
        $scope.saving = false;
        var textWatcher = $scope.$watch('dojo', function (newVal, oldVal) {
          if (!_.isEmpty(newVal)){
            var text = 'Connect with EventBrite'
            if ($scope.dojo && $scope.dojo.eventbriteToken){
              text = 'Reconnect with EventBrite';
            }
            $scope.eventbriteText = $translate.instant(text);
            textWatcher();
          }
        });

        var genErrorHandler = function () {
          alertService.showError($translate.instant('There was an error on this page. Our technical staff have been notified'), function(){
            $state.go('edit-dojo', {id: dojoId});
          });
        };

        $scope.authorizeOAuthEventBrite = function () {
          cdEventbriteService.getPublicToken()
          .then(function (response) {
            $localStorage.eventbriteDojo = $scope.dojo.id;
            if (response.data.token) {
              $window.location.href=  'https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=' + response.data.token;
            } else {
              // Something went wrong on our side TODO log with logentries
              genErrorHandler();
            }
          })
          .catch(function (err) {
            // Something went wrong on our side TODO log with logentries
            genErrorHandler();
          });
        };
        var token = $stateParams.code;
        var dojoId = $localStorage.eventbriteDojo;
        if (!_.isUndefined(token)) {
          $scope.saving = true;
          // Commented for testing purpose
          //  delete $localStorage.eventbriteDojo;
          cdEventbriteService.authorize(dojoId, {code: token})
          .then(function () {
            $state.go('edit-dojo', {id: dojoId});
            atomicNotifyService.info($translate.instant('Your eventbrite account has been successfully attached'), 5000);
          });
        }
      }

    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdEventbriteIntegration', ['$window', 'cdEventbriteService', 'alertService', 'atomicNotifyService',
     '$localStorage', '$stateParams', '$state', '$translate', '$rootScope',
     cdEventbriteIntegration]);

}());
