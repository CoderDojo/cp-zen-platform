;(function() {
  'use strict';

/**
 * [cdRoundedImage description]
 * For upload, scope must contains upload function and return the new image path
 * @return {[type]} [description]
 */
function cdRoundedImage(){
    return {
      scope: {
        src: '@?',
        srcId: '@?',
        srcFallback: '@?',
        alt: '@',
        size: '=?',
        edit: '=?',
        upload: '=?'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-rounded-image',
      controller: ['$scope', 'atomicNotifyService', '$translate', '$http', '$timeout',
      function ($scope, atomicNotifyService, $translate, $http, $timeout) {
        this.srcFallback = $scope.srcFallback || 'https://placekitten.com/g/400/400';
        this.src = $scope.src ? $scope.src : this.srcFallback;
        this.size = $scope.size ? $scope.size : '200px';
        this.edit = $scope.edit ? $scope.edit : false;
        this.fullWidth = false;
        this.saved = false;
        var cdRI = this;

        var srcWatcher = $scope.$watch('src', function(newSrc, oldSrc){
          if (newSrc) {
            cdRI.src = newSrc;
          }
        });

        var idWatcher = $scope.$watch('srcId', function(newId, oldId){
          if (newId) {
            cdRI.srcId = newId;
            cdRI.src += $scope.srcId ? $scope.srcId : '';
            $timeout(function () {
              var image = angular.element(
                document.getElementsByClassName(cdRI.edit ?
                  'cd-rounded-image__img--edit-default':
                  'cd-rounded-image__img--display'));
              image.bind('error', function () {
                cdRI.src = cdRI.srcFallback;
              });
            });
            idWatcher();
          }
        });

        var altWatcher = $scope.$watch('alt', function(newAlt, oldAlt){
          if (newAlt) {
            cdRI.srcId = newAlt;
            altWatcher();
          }
        });

        this.toggleFullWidth = function (){
          return this.fullWidth = !this.fullWidth;
        }
        this.submit = function () {
          if (this.file) {
            this.upload(this.file)
            .then(function(uploaded) {
              atomicNotifyService.info($translate.instant('Image successfully updated'));
              // Date.now is a hack to refresh the ng-src, because, yeah.
              cdRI.src = uploaded + "#" + Date.now();
              cdRI.canSave = false;
            });
          }
        };

        // upload on file select or drop
        this.upload = $scope.upload;

        $scope.$on('$destroy', function(){
          srcWatcher();
        })
      }],
      controllerAs: 'cdRI'
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdRoundedImage', [cdRoundedImage]);

}());
