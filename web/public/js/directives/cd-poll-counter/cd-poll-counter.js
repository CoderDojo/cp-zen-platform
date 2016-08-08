;(function() {
  'use strict';

function cdPollCounter($compile, cdPollService, $interval){
    return {
      scope: {
        pollId : '=',
        label: '='
      },
      restrict: 'E',
      template: '<div class="poll-counter row text-center"><span class="poll-values"></span><span>{{ label }}</span></div>',
      controller: function($scope){
        $scope.counter = 0;
        $interval(function(){
          getLastCount();
        }, 1000);
        var getLastCount = function () {
          cdPollService.count($scope.pollId,
            function(counter){
              $scope.counter = counter.count;
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

        var counterWatcher = scope.$watch('counter', function(newCounter, oldCount){
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
