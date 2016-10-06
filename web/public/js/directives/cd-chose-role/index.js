;(function() {
  'use strict';

function cdChoseRole(){
    return {
      restrict: 'A',
      controller: ['$scope', 'cdChooseRoleModal', '$translate', 'translationKeys', function ($scope, cdChooseRoleModal, $translate, translationKeys) {
        var cdCR = this;

        this.submit = function () {
          cdChooseRoleModal({
            roles: $scope.roles,
            callback: $scope.modalCallback,
            title: $translate.instant('Join Dojo As...'),
            subTitle: $scope.isAdult ?
              $translate.instant(translationKeys.JOIN_DOJO_ADULT_SUBTITLE) :
              $translate.instant(translationKeys.JOIN_DOJO_YOUTH_SUBTITLE),
            size: $scope.roles.length > 1 ? 'lg': 'md'
          });
        }
      }],
      link: function(scope, element) {
        element.on('click', scope.cdCR.submit);
      },
      controllerAs: 'cdCR'
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdChoseRole', [cdChoseRole]);

}());
