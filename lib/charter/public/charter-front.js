;(function(angular){
  'use strict';

  var window = this;

  function cdCharter(){
    return {
      restrict: 'E',
      templateUrl: '/content/charter/cd-charter-template.html',
      controller: cdCharterCtrl
    }
  }

  function cdCharterCtrl($scope, cdCharterService) {
    cdCharterService.load(function(response) {
      $scope.charterText = response;
    });
  }

  function cdCharterService(cdApi){
    function topfail(err){
      console.log(err);
    }

    return {
      load: function(win, fail){
        cdApi.get('charter', win, fail || topfail);
      }
    }
  }

  angular
    .module('cdCharter',[])
    .directive('cdCharter', cdCharter)
    .service('cdCharterService', cdCharterService);

}.call(window, angular));