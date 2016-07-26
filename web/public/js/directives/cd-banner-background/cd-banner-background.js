;(function() {
  'use strict';

function cdBannerBackground(){
    return {
      scope: {
        src: '=?',
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-banner-background/cd-banner-background',
      controller: function ($scope) {
        var imageWatcher = $scope.$watch('src', function(newSrc, oldSrc){
          if (newSrc) {
            $scope.src = newSrc;
            imageWatcher();
          }
        });
      },
      transclude: true
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdBannerBackground', [cdBannerBackground]);

}());
