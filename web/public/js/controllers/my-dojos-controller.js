'use strict';

function cdMyDojosCtrl($scope, $window, $state, $stateParams, cdDojoService, $location, auth, tableUtils, alertService, $translate) {
  $scope.itemsPerPage = 10;

  $scope.pageChanged = function(){
    $scope.loadPage(currentUser, false);
  }

  $scope.editDojo = function(dojo) {
    cdDojoService.setDojo(dojo, function(response) {
      $location.path('/dashboard/edit-dojo');
    }, function (err){
      if(err){
        alertService.showError(
          $translate.instant('An error has occurred while editing dojo') + ' <br /> '+
          (err.error || JSON.stringify(err))
        );
      }
    });
  }

  $scope.deleteDojo = function(dojo) {
    cdDojoService.delete(dojo.id, function(response) {
      $state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
    }, function (err){
      if(err){
        alertService.showError(
          $translate.instant('An error has occurred while deleting dojo') + ' <br /> '+
          (err.error || JSON.stringify(err))
        );
      }
    });
  }

  $scope.loadPage = function(currentUser, resetFlag, cb){
    cb = cb || function(){};

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, $scope.filterQuery, $scope.sort);
    $scope.pageNo = loadPageData.pageNo;
    $scope.myDojos = [];

    var search = {
      sort: {
        created: 1
      },
      from: loadPageData.skip,
      size: $scope.itemsPerPage
    };

    cdDojoService.myDojos(search, currentUser).then(function(result) {
      _.each(result.records, function (dojo) {
        dojo.country = dojo.country.alpha2.toLowerCase();
        var path = dojo.urlSlug.split('/');
        path.splice(0, 1);
        path = path.join('/');
        dojo.path = path;
      });
      $scope.myDojos = result.records;
      $scope.totalItems = result.total;

      return cb();
    }, function(err) {
      alertService.showError(
        $translate.instant('An error has occurred while loading Dojos') + ' <br /> '+
        (err.error || JSON.stringify(err))
      );

      return cb(err);
    });

  };

  var currentUser;
  auth.get_loggedin_user(function(user) {
    currentUser = user;
    $scope.loadPage(currentUser, true);
  });
}

angular.module('cpZenPlatform')
  .controller('my-dojos-controller', ['$scope', '$window', '$state', '$stateParams', 'cdDojoService', '$location', 'auth', 'tableUtils', 'alertService', '$translate',cdMyDojosCtrl]);
