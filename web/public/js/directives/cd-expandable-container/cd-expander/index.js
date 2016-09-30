;(function() {
  'use strict';

function cdExpander(){
    return {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-expandable-container/cd-expander',
      require: '^cdExpandableContainer',
      controller: function($scope, $timeout) {
        var cdExpander = this;
        this.cdExpandableContainer = $scope.cdExpandableContainer;
        var watcher = $scope.$watch('cdExpandableContainer.expanded', function(newExpanded){
          $timeout(function(){
            cdExpander.expanded = newExpanded;
          }, 0);
        });
        $scope.$on('$destroy', function(){
          watcher();
        })
      },
      controllerAs: 'cdExpander'
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdExpander', [cdExpander]);
}());
