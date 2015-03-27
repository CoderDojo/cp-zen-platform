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

  function cdCreateDojo(){
    return {
      restrict: 'E',
      templateUrl: '/content/dojos/cd-create-dojo-template.html',
      controller: cdCreateDojoCtrl
    }
  }

  function cdDojoListCtrl($scope, cdDojoService) {
    cdDojoService.list(function(response) {
      $scope.dojoData = response;
    });

  }

  function cdCreateDojoCtrl($scope, $window, $routeParams, cdDojoService, alertService) {
    console.log($routeParams.id);

    $scope.save = function(dojo) {
      cdDojoService.save(dojo, function(response) {
        alertService.showAlert("Your Dojo has been successfully saved", function() {
          $window.location.href = '/my-dojos'; 
        });
      }, function(err) {
        alertService.showError(
          'An error has occurred while saving: <br /> '+
          (err.error || JSON.stringify(err))
        );
      });
    }

    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
    
    $scope.editorOptions = {
      language: 'en',
      uiColor: '#000000',
      height:'200px'
    };

  }

  function cdMyDojosCtrl($scope, $window, cdDojoService, $location, auth, tableUtils, alertService, loadMyDojosService) {
    var currentUser;
    auth.get_loggedin_user(function(user) {
      currentUser = user;
      $scope.loadPage(currentUser, true);
    });

    $scope.itemsPerPage = 10;

    $scope.pageChanged = function(){
      $scope.loadPage(currentUser, false);
    }

    $scope.editDojo = function(dojo) {
      $window.location.href = '/edit-dojo/'+dojo.id;
    }

    $scope.loadPage = function(currentUser, resetFlag, cb){
      cb = cb || function(){};
      var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, $scope.filterQuery, $scope.sort);
      $scope.pageNo = loadPageData.pageNo;
      $scope.myDojos = [];
      loadMyDojosService.loadMyDojos(loadPageData.config, currentUser , function(err, results){
        if(err){
          alertService.showError(
            'An error has occurred while loading Dojos: <br /> '+
            (err.error || JSON.stringify(err))
          );
          return cb(err);
        }
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
      count: function(currentUser, win, fail){
        cdApi.post('dojos/my_dojos_count', {user: currentUser}, win, fail || topfail);
      },
      search: function (query, currentUser, win, fail) {
        cdApi.post('dojos/my_dojos_search', {query: query, user:currentUser}, win, fail || topfail);
      },
      save: function(dojo, win, fail) {
        if (dojo.id) {
          cdApi.put('dojos/' + dojo.id, { dojo: dojo }, win, fail);
        }
        else {
          cdApi.post('dojos', { dojo: dojo }, win, fail || topfail);
        } 
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
    .directive('cdCreateDojo', cdCreateDojo)
    .service('cdDojoService', cdDojoService)
    .service('loadMyDojosService', loadMyDojosService);

}.call(window, angular));