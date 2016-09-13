;(function() {
  'use strict';

function cdPollForm($compile, cdPollService, atomicNotifyService, $state, $translate){
    return {
      scope: {
        question: '=',
        poll: '=',
        dojoId: '='
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/poll/form',
      controller: function($scope){
        $scope.buttonText = $translate.instant('Submit!');
        $scope.answer = 0;
        $scope.save = function(){
          cdPollService.save({pollId: $scope.poll.id, dojoId: $scope.dojoId, value: $scope.answer},
            function(){
              atomicNotifyService.info($translate.instant('Thanks for submitting your information!\n We will be sharing the final results of this survey with the community once it has been collected.'), 5000);
              $state.go('poll-stats', {pollId: $scope.poll.id});
          });
        };
        var pollWatcher = $scope.$watch('poll', function(newPoll, oldPoll){
          if(newPoll){
            pollWatcher();
            cdPollService.getResults({dojoId: $scope.dojoId, pollId: newPoll.id},
              function(results){
                if(results.length >= $scope.poll.maxAnswers){
                  atomicNotifyService.info($translate.instant('Your Dojo already submitted its answer, thanks for your participation !'), 5000);
                  $state.go('poll-stats', {pollId: newPoll.id});
                }
              });
          }
        });
      },
      replace: true
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdPollForm', ['$compile', 'cdPollService', 'atomicNotifyService', '$state', '$translate', cdPollForm]);

}());
