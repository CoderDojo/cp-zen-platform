'use strict';

function cdMyDojosCtrl($scope, $window, $state, $stateParams, cdDojoService, $location, auth, tableUtils, alertService, AlertBanner) {
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
            message: '<a class="a-no-float" href="/dashboard/setup-dojo/' + uncompletedDojo.dojoLeadId + '" >Please click here to complete all of the recommended practices for ' + uncompletedDojo.name + '</a>',
            autoClose: false,
            onOpen: function() {
              angular.element('.a-no-float').on('click', function(e){
                if(angular.element('.alert-message').hasClass('active')){
                  angular.element('.alert-message').removeClass('active')
                }
              });
            }
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
  .controller('my-dojos-controller', ['$scope', '$window', '$state', '$stateParams', 'cdDojoService', '$location', 'auth', 'tableUtils', 'alertService', 'AlertBanner', cdMyDojosCtrl]);
