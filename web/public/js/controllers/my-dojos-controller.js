'use strict';

function cdMyDojosCtrl($q, $scope, $window, $state, $stateParams, cdDojoService, $location, auth, tableUtils, alertService, $translate, AlertBanner) {
  $scope.itemsPerPage = 10;
  var currentUser;
  $scope.myDojosPageTitle = $translate.instant('My Dojos'); //sets breadcrumb page title

  $scope.pageChanged = function(){
    $scope.loadPage(currentUser, false);
  };

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
  };

  $scope.deleteDojo = function(dojo) {
    var hasPermission = false;
    canDeleteDojo(dojo, function (result) {
      hasPermission = result;
      if(hasPermission) {
        cdDojoService.delete(dojo.id, function(response) {
          $state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
        }, function (err) {
          if(err){
            alertService.showError(
              $translate.instant('An error has occurred while deleting dojo') + ' <br /> '+
              (err.error || JSON.stringify(err))
            );
          }
        });
      } else {
        alertService.showAlert($translate.instant('You do not have permission to delete this Dojo'));
      }
    });
  };

  function canDeleteDojo (dojo, cb) {
    //User can delete dojo if:
    // - They have the champion user type
    // - They have the Dojo Admin Permission
    // - They are the current owner of the Dojo
    var isChampion;
    var isDojoAdmin;
    var isDojoOwner;
    var query = {userId: currentUser.id, dojoId:dojo.id};

    function getUsersDojos() {
      return $q(function(resolve, reject) {
        cdDojoService.getUsersDojos(query, function (response) {
          var userDojo    = response[0];
          isChampion  = _.contains(userDojo.userTypes, 'champion');
          isDojoAdmin = _.find(userDojo.userPermissions, function(userPermission) {
                          return userPermission.name === 'dojo-admin';
                        });
          if(userDojo.owner === 1) isDojoOwner = true;
          else isDojoOwner = false;
           if(isChampion && isDojoAdmin && isDojoOwner) resolve(true);
           else resolve(false);
        }, function (err) {
          reject( $translate.instant('Error loading user dojo entity') + ' <br /> ' +
          (err.error || JSON.stringify(err)));
        });
      });
    }

    getUsersDojos().then(function (result) {
      cb(result);
    }, function (err) {
      alertService.showError(err);
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
        canDeleteDojo(dojo, function (result) {
          dojo.canDelete$ = result;
        });
      });
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
                  angular.element('.alert-message').removeClass('active');
                }
              });
            }
          });
        }
        return cb();
      });
    }, function(err) {
      alertService.showError(
        $translate.instant('An error has occurred while loading Dojos') + ' <br /> '+
        (err.error || JSON.stringify(err))
      );

      return cb(err);
    });

  };

  auth.get_loggedin_user(function(user) {
    currentUser = user;
    $scope.loadPage(currentUser, true);
  });
}

angular.module('cpZenPlatform')
  .controller('my-dojos-controller', ['$q', '$scope', '$window', '$state', '$stateParams', 'cdDojoService', '$location', 'auth', 'tableUtils', 'alertService', '$translate', 'AlertBanner', cdMyDojosCtrl]);
