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

  function cdMyDojos(){
    return {
      restrict: 'E',
      templateUrl: '/content/dojos/cd-my-dojos-template.html',
      controller: cdMyDojosCtrl
    }
  }

  function cdDojoListCtrl($scope, cdDojoService) {
    cdDojoService.list(function(response) {
      $scope.dojoData = response;
    });

  }

  function cdMyDojosCtrl($scope, cdDojoService, auth, tableUtils, loadMyDojosService) {
    var currentUser;
    auth.get_loggedin_user(function(user) {
      currentUser = user;
      //cdDojoService.listMyDojos(currentUser, function(response) {
      //  $scope.myDojos = response;
      //});
      $scope.loadPage(currentUser, true);
    });

    $scope.itemsPerPage = 1;

    $scope.pageChanged = function(){
      $scope.loadPage(currentUser, false);
    }

    $scope.loadPage = function(currentUser, resetFlag, cb, alertService){
      cb = cb || function(){};
      var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, $scope.filterQuery, $scope.sort);

      $scope.pageNo = loadPageData.pageNo;
      $scope.myDojos = [];
      //spinnerService.spin('myDojosTable');
      loadMyDojosService.loadMyDojos(loadPageData.config, currentUser , function(err, results){
        if(err){
          alertService.showError(
            'An error has occurred while loading Dojos: <br /> '+
            (err.error || JSON.stringify(err))
          );
          return cb(err);
        }
        //spinnerService.stop('myDojosTable');
        $scope.totalItems = +results.totalItems;
        $scope.myDojos = results.myDojos;

        return cb();
      });
    };
  }

  function cdDojoService(cdApi){
    function topfail(err){
      console.log(err);
    }

    return {
      list: function(win, fail){
        cdApi.get('dojos', win, fail || topfail);
      },
      listMyDojos:function(currentUser, win, fail) {
        cdApi.get('dojos/' + currentUser.id, win, fail || topfail);
      },
      count: function(user, win, fail){
        cdApi.post('dojos/count', {user: user}, win, fail || topfail);
      },
      search: function (query, currentUser, win, fail) {
        cdApi.post('dojos/my_dojos_search', {query: query, user:currentUser}, win, fail || topfail);
      }
    }
  }

  function loadMyDojosService(cdDojoService) {
    var totalItems, fail;
    
    var loadMyDojos = function(config, currentUser, cb){
    
      fail = function(err) {
        cb(err);
      }

      cdDojoService.count(currentUser, function(count){
        totalItems = count;

        cdDojoService.search(config, currentUser,
          function(result){
            cb(null, {totalItems: count, myDojos: result});
          }, fail);
      }, fail);
    }

    return {loadMyDojos: loadMyDojos};
  }

  angular
    .module('cdDojos',[])
    .directive('cdDojoList', cdDojoList)
    .directive('cdMyDojos', cdMyDojos)
    .service('cdDojoService', cdDojoService)
    .service('loadMyDojosService', loadMyDojosService);

}.call(window, angular));