;(function() {
  'use strict';

function cdDojoForm(){
    return {
      restrict: 'EA',
      template: '<ng-include src="url"/>',
      // controller: function($scope) {
      //   var cdDF = this;
      //   $scope.getTemplateUrl = function (){
      //     return $scope.forms[this.formName];
      //   }
      // },
      link: function(scope, elem, attrs){
        this.formName = attrs.cdDojoForm;
        scope.url = '/directives/tpl/dojo/dojo-form/cd-dojo-form-' + this.formName;
      }
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoForm', [cdDojoForm]);

}());
