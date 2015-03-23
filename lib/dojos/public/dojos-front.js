;(function(angular){
  'use strict';

  var window = this;

  function cdDojoList(){
    return {
      restrict: 'E',
      templateUrl: '/content/dojos/cd-dojo-list-template.html',
      controller: cdDojoListCtrl
    }
  }

  function cdDojoListCtrl($scope, cdDojoService) {
    cdDojoService.list(function(response) {
      $scope.dojoData = response;
    });

  }

  function cdDojoService(cdApi){
    function topfail(err){
      console.log(err);
    }

    return {
      list: function(win, fail){
        cdApi.get('dojos', win, fail || topfail);
      }
    }
  }

  angular
    .module('cdDojos',[])
    .directive('cdDojoList', cdDojoList)
    .service('cdDojoService', cdDojoService);

}.call(window, angular));