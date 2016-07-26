;(function() {
  'use strict';

function cdRoundedImage(){
    return {
      scope: {
        src: '@?',
        srcId: '@?',
        alt: '@',
        size: '=?',
        edit: '=?',
        upload: '=?'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-rounded-image/cd-rounded-image',
      controller: ['$scope', 'atomicNotifyService', '$translate', function ($scope, atomicNotifyService, $translate) {
        this.fallbackSrc = 'https://placekitten.com/g/400/400';
        this.src = $scope.src ? $scope.src : this.fallbackSrc;
        this.size = $scope.size? $scope.size : '200px';
        this.edit = $scope.edit ? $scope.edit : false;
        this.fullWidth = false;
        var cdRI = this;
        var idWatcher = $scope.$watch('srcId', function(newId, oldId){
          if (newId) {
            cdRI.srcId = newId;
            cdRI.src += $scope.srcId ? $scope.srcId : '';
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
            });
          }
        };

        // upload on file select or drop
        this.upload = $scope.upload;
      }],
      controllerAs: 'cdRI'
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdRoundedImage', [cdRoundedImage]);

}());
