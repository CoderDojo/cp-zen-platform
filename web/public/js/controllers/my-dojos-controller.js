'use strict';

function cdMyDojosCtrl($q, $rootScope, $scope, $state, $stateParams, $cookieStore, cdDojoService, $location, auth, tableUtils, alertService, $translate, AlertBanner) {
  $scope.itemsPerPage = 10;
  var currentUser;
  $scope.myDojosPageTitle = $translate.instant('My Dojos'); //sets breadcrumb page title
  var errorMsg = $translate.instant('error.general');

  $rootScope.$watch(function() {
      return $location.path();
    },
    function(path){
      if(angular.element('.alert-message').hasClass('active') &&
        angular.element('.alert-message').hasClass('info') && path !== '/'){
        angular.element('.alert-message').removeClass('active');
      }
    }
  );

  $scope.pageChanged = function(){
    $scope.loadPage(currentUser, false);
  };

  $scope.editDojo = function(dojo) {
    cdDojoService.setDojo(dojo, function(response) {
      $location.path('/dashboard/edit-dojo');
    }, function (err){
      if(err){
        alertService.showError(
          $translate.instant('An error has occurred while editing dojo')
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
              $translate.instant('An error has occurred while deleting dojo')
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
          reject( $translate.instant('Error loading user dojo entity'));
        });
      });
    }

    getUsersDojos().then(function (result) {
      cb(result);
    }, function (err) {
      alertService.showError(errorMsg);
    });
  }

  function getUsersDojos(query, cb) {
    cdDojoService.getUsersDojos(query, function (response) {
      return cb(null, response);
    }, function (err) {
      return cb(err);
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

    cdDojoService.myDojos(search).then(function(result) {
      async.each(result.records, function (dojo, cb) {
          var query = {userId: currentUser.id, dojoId: dojo.id};
          getUsersDojos(query, function (err, response) {
            if(err) return cb(err);
            var userDojo = response[0];
            var isChampion = _.contains(userDojo.userTypes, 'champion');
            var isTicketingAdmin = _.find(userDojo.userPermissions, function (permission) {
              return permission.name === 'ticketing-admin';
            });
            var isDojoAdmin = _.find(userDojo.userPermissions, function (permission) {
              return permission.name === 'dojo-admin';
            });
            dojo.isChampion = isChampion;
            dojo.isTicketingAdmin = isTicketingAdmin;
            dojo.isDojoAdmin = isDojoAdmin;
            dojo.country = dojo.alpha2.toLowerCase();
            var path = dojo.urlSlug.split('/');
            path.splice(0, 1);
            path = path.join('/');
            dojo.path = path;
            canDeleteDojo(dojo, function (result) {
              dojo.canDelete$ = result;
            });
            return cb();
        });
      }, function (err) {
        $scope.myDojos = result.records;
        $scope.totalItems = result.total;

        if($scope.myDojos && $scope.myDojos.length > 0 && !$cookieStore.get('recommendedPracticesAlertShown')) {
          cdDojoService.uncompletedDojos(function (response) {
            if(response.length > 0) {
              var uncompletedDojo = response[0];
              AlertBanner.publish({
                type: 'info',
                message: '<a class="a-no-float" href="/dashboard/setup-dojo/' + uncompletedDojo.dojoLeadId + '" >' + $translate.instant('Please click here to complete all of the recommended practices for') + ' ' + uncompletedDojo.name + '</a>',
                autoClose: false,
                onOpen: function () {
                  angular.element('.a-no-float').on('click', function (e) {
                    if (angular.element('.alert-message').hasClass('active')) {
                      angular.element('.alert-message').removeClass('active');
                    }
                  });
                },
                onClose: function () {
                  $cookieStore.put('recommendedPracticesAlertShown', true);
                }
              });
            }
            return cb();
          });
        }
      });
    }, function(err) {
      alertService.showError(
        $translate.instant('An error has occurred while loading Dojos')
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
  .controller('my-dojos-controller', ['$q', '$rootScope', '$scope', '$state', '$stateParams', '$cookieStore', 'cdDojoService', '$location', 'auth', 'tableUtils', 'alertService', '$translate', 'AlertBanner', cdMyDojosCtrl]);
