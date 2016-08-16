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
        upload: '=?',
        format: '=?' // fallback for base64 to avoid the S3 request
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-rounded-image',
      controller: ['$scope', 'atomicNotifyService', '$translate', '$http', function ($scope, atomicNotifyService, $translate, $http) {
        this.srcFallback = $scope.srcFallback || 'https://placekitten.com/g/400/400';
        this.src = $scope.src ? $scope.src : this.fallbackSrc;
        this.size = $scope.size? $scope.size : '200px';
        this.edit = $scope.edit ? $scope.edit : false;
        this.fullWidth = false;
        this.format = $scope.format;
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
            idWatcher();
            if(_.isUndefined(cdRI.format)) {
              $http.head(cdRI.src).then(function successCallback(response) {
                //Nothing to do, it all works as expected, the image is stored online
              }, function errorCallback(response) {
                //File doesn't exists, we should fallback
                cdRI.src = cdRI.srcFallback;
              });
            }
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
