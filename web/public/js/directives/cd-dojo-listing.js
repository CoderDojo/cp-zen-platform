;(function() {
  'use strict';

function cdDojoListing(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-four-dojo-listing',
      controller: ['$scope', function($scope) {
        $scope.dojoImageUrl = '/img/avatars/dojo-default-logo.png';
      }]
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoListing', cdDojoListing)

}());
