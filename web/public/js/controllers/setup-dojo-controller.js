'use strict';

function cdSetupDojoCtrl($scope, $state, $stateParams, cdDojoService) {

  $scope.pageChanged = function(){
    $scope.loadPage(currentUser, false);
  }

  $scope.editDojo = function(dojo) {
    cdDojoService.setDojo(dojo, function(response) {
      $location.path('/dashboard/edit-dojo');
    }, function (err){
      if(err){
        alertService.showError(
          'An error has occurred while editing dojo: <br /> '+
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
          'An error has occurred while deleting dojo: <br /> '+
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
      $scope.myDojos = result.records;
      $scope.totalItems = result.total;

      cdDojoService.uncompletedDojos(function(response){
        if(response.length > 0){
          var uncompletedDojo = response[0];
          AlertBanner.publish({
            type: 'info',
            message: 'some message',
            timeCollapse: 1000000
          });
        }
        return cb();
      });
    }, function(err) {
      alertService.showError(
        'An error has occurred while loading Dojos: <br /> '+
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
  .controller('my-dojos-controller', ['$scope', '$state', '$stateParams', 'cdDojoService', cdSetupDojoCtrl]);
