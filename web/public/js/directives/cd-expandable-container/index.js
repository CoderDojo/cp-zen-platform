;(function() {
  'use strict';

function cdExpandableContainer(){
    return {
      restrict: 'EA',
      controller: ['$scope', '$element', '$timeout', function($scope, $element, $timeout){
        var cdExpandableContainer = this;
        var expandableBlock = angular.element($element.find('.cd-expandable-block'));

        this.expanded = false;
        this.shouldDisplay = false;
        var wheightWatcherRunning = false;
        var wheightWatcher = $scope.$watch( function() {return $element.find('.cd-expandable-block')[0].scrollHeight;}, function(newHeight){
          if (!wheightWatcherRunning) {
            wheightWatcherRunning = true;
            requestAnimationFrame(function () {
              if ($element.find('.cd-expandable-block')[0].scrollHeight > cdExpandableContainer.initialHeight) {
                cdExpandableContainer.shouldDisplay = true;
                expandableBlock.addClass('cd-expandable-block--expandable');
              } else {
                cdExpandableContainer.shouldDisplay = false;
                expandableBlock.removeClass('cd-expandable-block--expandable');
              }
              wheightWatcherRunning = false;
            });
          }
        });
        $scope.$on('$destroy', function(){
          wheightWatcher();
        })

        this.toggleExpanded = function () {
          cdExpandableContainer.expanded = !cdExpandableContainer.expanded;
          if (cdExpandableContainer.expanded) {
            expandableBlock.css('max-height', expandableBlock[0].scrollHeight);
            $timeout(function () {
              expandableBlock.css('max-height', 'inherit');
              expandableBlock.addClass('cd-expandable-block--expanded');
            }, 200)
          } else {
            expandableBlock.css('max-height', expandableBlock[0].scrollHeight);
            expandableBlock.removeClass('cd-expandable-block--expanded');
            requestAnimationFrame(function () {
              expandableBlock.css('max-height', cdExpandableContainer.extendedHeight);
            });
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
