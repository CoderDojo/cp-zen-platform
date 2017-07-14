'use strict';

function cdMyDojosCtrl($q, $rootScope, $scope, $state, $stateParams, $cookieStore, cdDojoService, $location, auth, tableUtils, alertService, $translate, AlertBanner, usSpinnerService) {
  $scope.itemsPerPage = 5;
  $scope.pagination = {};
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
    $scope.loadPage($scope.currentUser, false);
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

  $scope.loadPage = function(currentUser, resetFlag, cb){
    cb = cb || function(){};

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pagination.pageNo, $scope.filterQuery, $scope.sort);
    $scope.myDojos = [];

    var query = {
      sort$: {
        created: 1
      },
      verified: 1,
      skip$: loadPageData.skip,
      limit$: $scope.itemsPerPage
    };
    var getVerifiedDojos = function () {
      return cdDojoService.joinedDojos(query)
      .then(function (result) {
        $scope.myDojos = result.records;
        $scope.totalItems = result.total;
        var promises = [];
        async.each(result.records, function (dojo, cb) {
          var query = {userId: currentUser.id, dojoId: dojo.id};
          var promise = cdDojoService.getUsersDojos(query)
          .then(function (response) {
            var userDojo = response.data[0];
            var isChampion = _.includes(userDojo.userTypes, 'champion');
            var isTicketingAdmin = _.find(userDojo.userPermissions, function (permission) {
              return permission.name === 'ticketing-admin';
            });
            var isDojoAdmin = _.find(userDojo.userPermissions, function (permission) {
              return permission.name === 'dojo-admin';
            });
            dojo.isChampion = isChampion;
            dojo.isTicketingAdmin = isTicketingAdmin;
            dojo.isDojoAdmin = isDojoAdmin;
            if (dojo.alpha2) dojo.country = dojo.alpha2.toLowerCase();
            var path = dojo.urlSlug.split('/');
            path.splice(0, 1);
            path = path.join('/');
            dojo.path = path;
          });
          promises.push(promise);
        });
        return $q.all(promises)
        .catch(function (err) {
          alertService.showError(
            $translate.instant('An error has occurred while loading Dojos')
          );
        });
      }).finally(function () {
        usSpinnerService.stop('my-dojos-spinner');
      });
    };

    var showBanner = function () {
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
    };
    var getPendingApplications = function () {
      var query = {userId: $scope.currentUser.id, deleted: 0,
         skip$: loadPageData.skip, limit$: $scope.itemsPerPage,
         sort$: {createdAt: 1}};
      if ($scope.myDojos.length > 0) query.id = {nin$: _.map($scope.myDojos, 'dojoLeadId')};
      return cdDojoService.searchDojoLeads(query)
      .then(function (res) {
        usSpinnerService.stop('my-dojos-spinner');
        $scope.applications = res.data;
      });
    };
    getVerifiedDojos()
    .then(showBanner())
    .then(getPendingApplications());
  };

  auth.get_loggedin_user(function(user) {
    $scope.currentUser = user;
    $scope.loadPage($scope.currentUser, true);
  });

}

angular.module('cpZenPlatform')
  .controller('my-dojos-controller', ['$q', '$rootScope', '$scope', '$state', '$stateParams', '$cookieStore', 'cdDojoService', '$location', 'auth', 'tableUtils', 'alertService', '$translate', 'AlertBanner', 'usSpinnerService', cdMyDojosCtrl]);
