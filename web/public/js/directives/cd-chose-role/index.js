;(function() {
  'use strict';

function cdChoseRole(){
    return {
      restrict: 'A',
      controller: ['$scope', 'cdChooseRoleModal', '$translate', function ($scope, cdChooseRoleModal, $translate) {
        var cdCR = this;

        this.submit = function () {
          cdChooseRoleModal({
            roles: $scope.roles,
            callback: $scope.modalCallback,
            title: $translate.instant('Join Dojo As...'),
            subTitle: $scope.isAdult
              ? 'You will be joined to a Dojo as an adult, along with any young people added to your profile. We would like to know if you have any volunteering role in the Dojo too.'
              : 'If you join the Dojo you will receive event updates from the Dojo! If you aren\'t a Dojo attendee and want to join as a volunteer or Champion please get in touch with info@coderdojo.org'
            size: cdCR.roles.length > 1 ? 'lg': 'md'
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
