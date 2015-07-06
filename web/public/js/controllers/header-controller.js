'use strict';

function headerCtrl($window, $scope, $localStorage, cdUsersService, alertService) {
  $scope.navigateTo = function (page) {
    $window.location.href = '/' + page;
  };

  $scope.userIsCDFAdmin = function () {
  	return _.contains($scope.user.roles, 'cdf-admin');
  };

  $scope.userIsChampion = function(cb) {
    cdUsersService.isChampion($scope.user.id, function(res){
      return cb(res);
    }, function(err) {
      alertService.showError(
        'An error has occurred while checking user: <br /> '+
        (err.error || JSON.stringify(err))
      );

      return cb(err);
    })
  };

  $scope.selectTab = function (tab) {
    $localStorage.selectedTab = tab;
  }

  $scope.isSelected = function (tab) {
    if ($localStorage.selectedTab === tab) return true;
    else return false;
  }

  $scope.selectedTab = $localStorage.selectedTab;

  if($scope.user) {
    if ($scope.userIsCDFAdmin()) {
      bootIntercom();
    } else {
      $scope.userIsChampion(function(res){
        if(res.isChampion){
          bootIntercom(res.dojos);
        }
      })
    }
  }

  function bootIntercom(dojos){
    var dojoIds = null;
    $localStorage.dojoIds = null;

    if(dojos){
      dojoIds = _.pluck(dojos.records, 'id').toString();
      $localStorage.dojoIds = dojoIds;
    }

    var userData = {
      name: $scope.user.name,
      email: $scope.user.email,
      created_at: moment().unix(),
      app_id: "x7bz1cqn",
      user_id: $scope.user.id,
      widget: {
        activator: "#IntercomDefaultWidget"
      },
      dojos: dojoIds
    };

    $window.Intercom('boot', userData);
  }
}

angular.module('cpZenPlatform')
  .controller('header', ['$window', '$scope', '$localStorage', 'cdUsersService', 'alertService', headerCtrl]);
