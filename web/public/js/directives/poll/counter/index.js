;(function() {
  'use strict';

function cdPollCounter($compile, cdPollService, $interval){
    return {
      scope: {
        pollId : '=',
        label: '='
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/poll/counter',
      controller: function($scope){
        $scope.counter = 0;
        cdPollService.getPolledList($scope.pollId)
        .then(function(response){
          $scope.max = response.data.count;
        });
        $scope.lifebar = {};
        $scope.lifebar.full = $scope.lifebar.empty = [];
        var getRange = function (from, to ){
          return _.range(Math.round(from / 10) * 10 , Math.round(to / 10) * 10, 10);
        }
        $interval(function(){
          getLastCount();
        }, 1000);


        var getLastCount = function () {
          cdPollService.count($scope.pollId,
            function(counter){
              $scope.sum = counter.sum;
              $scope.counter = counter.count;
              $scope.getProgressBarStatus();
            });
        };

        $scope.getProgressBarStatus = function() {
          $scope.participationRatio = $scope.counter / $scope.max * 100;
          $scope.lifebar.full = getRange(0, $scope.participationRatio);
          $scope.lifebar.empty = getRange($scope.participationRatio, 100);
          var participationLevels = [
            {
              start: 25,
              name: 'info',
              label: 'Come on, pass the word to other champions, we can do better :)'
            }, {
              start: 50,
              name: 'success',
              label: 'Not too bad, keep it going up!'
            }, {
              start: 75,
              name: 'warning',
              label: 'Great, more than 75% of participation!'
            }, {
              start: 90,
              name: 'danger',
              label: 'You\'re an incredible community <3'
            }
          ];

          $scope.participationLevel = _.find(participationLevels, function (level, index) {
            if ( index >= participationLevels.length ){
              return true;
            }
            if( $scope.participationRatio >= level.start ){
              if ($scope.participationRatio >= participationLevels[index +1].level){
                return false;
              }
              return true;
            } else {
              return true;
            }
          });
        };
        getLastCount();
      },
      link: function (scope, element, attrs) {
        var createCounterCase = function (number, valuesElement) {
          var numberTemplate = '<input type="text" disabled value="'+ number +'"/>';
          var aNumber = $compile(numberTemplate)(scope);
          valuesElement.append(aNumber);
        };

        var counterWatcher = scope.$watch('sum', function(newCounter, oldCount){
          var valuesElement = $('.poll-values');
          valuesElement.empty();
          if(newCounter > 0){
            _.each(newCounter, function(number){
              createCounterCase(number, valuesElement);
            });
          }else{
            createCounterCase(0, valuesElement);
          }
        });

        scope.$on('$destroy', function(){
          counterWatcher();
        });
      },
      replace: true
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdPollCounter', ['$compile', 'cdPollService', '$interval', cdPollCounter]);

}());
