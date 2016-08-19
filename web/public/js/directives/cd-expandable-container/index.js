;(function() {
  'use strict';

function cdExpandableContainer(){
    return {
      restrict: 'EA',
      controller: ['$scope', '$element', function($scope, $element){
        var cdExpandableContainer = this;
        this.expanded = false;
        this.shouldDisplay = false;
        var wheightWatcher = $scope.$watch( function() {return $element.find('.cd-expandable-block')[0].scrollHeight;}, function(newHeight){
          if (newHeight) {
            if ($element.find('.cd-expandable-block')[0].scrollHeight > cdExpandableContainer.initialHeight) {
              cdExpandableContainer.shouldDisplay = true;
            }
          }
        });
        $scope.$on('$destroy', function(){
          wheightWatcher();
        })

        this.toggleExpanded = function () {
          var expandableBlock = angular.element($element.find('.cd-expandable-block'));
          expandableBlock.toggleClass('cd-expandable-block--expanded');
          cdExpandableContainer.expanded = !cdExpandableContainer.expanded;
          if (cdExpandableContainer.expanded) {
            expandableBlock.css('max-height', expandableBlock[0].scrollHeight);
          } else {
            expandableBlock.css('max-height', cdExpandableContainer.extendedHeight);
          }
        }
      }],
      link: function(scope, element, attrs) {
        scope.cdExpandableContainer.initialHeight = attrs.cdExpandableContainer
        scope.cdExpandableContainer.extendedHeight = attrs.cdExpandableContainer + 'px';
        var expandableBlock = angular.element(element.find('.cd-expandable-block'));
        expandableBlock.css('max-height', scope.cdExpandableContainer.extendedHeight);

        // scope.cdExpandableContainer.height = angular.element('.cd-menu__content-container').outerHeight();
      },
      controllerAs: 'cdExpandableContainer'
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdExpandableContainer', [cdExpandableContainer]);
}());
