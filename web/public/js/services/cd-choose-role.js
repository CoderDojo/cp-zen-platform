;(function() {
  'use strict';

function cdChooseRoleModal($uibModal, alertService) {
  var cdCR = this;
  return function (options) {
    options = options || {};
    var roles = options.roles;
    var callback = options.callback;
    var title = options.title;
    var size = options.size || 'lg';
    var subTitle = options.subTitle;

    var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '/directives/tpl/cd-chose-role/modal',
        size: size,
        controller: function(){
          var cdCR = this;
          cdCR.roles = roles;
          cdCR.class = "col-xs-12 col-md-" + Math.round(12/cdCR.roles.length);
          cdCR.title = title;
          cdCR.subTitle = subTitle;

          this.select = function(role) {
            cdCR.loading = true;
            callback(role)
              .then(function (message) {
                alertService.showAlert(message);
                modalInstance.dismiss();
              })
              .catch(function (message) {
                alertService.showError(message);
              });
          }
          this.close = modalInstance.dismiss;
        },
        controllerAs: 'cdCR'
     });
  }
}

angular
    .module('cpZenPlatform')
    .factory('cdChooseRoleModal', ['$uibModal', 'alertService', cdChooseRoleModal]);

}());
