 'use strict';

function cdBadgesDashboardCtrl($scope, cdBadgesService) {
  $scope.badges = {};
  $scope.badgeInfo = {};
  $scope.badgeInfoIsCollapsed = {};
  var lastClicked = {};

  cdBadgesService.listBadges(function (response) {
    var badges = response.badges;

    //Filter badges because badgekit api doesn't support querying by tags.
    $scope.categories = ['programming', 'attendance', 'mentor'];
    
    _.each($scope.categories, function (category) {
      _.each(badges, function (badge) {
        var indexFound;
        var categoryFound = _.find(badge.tags, function (tag, index) {
          indexFound = index;
          return tag.value === category;
        });

        if(categoryFound) {
          var tmpBadge = angular.copy(badge);
          tmpBadge.tags.splice(indexFound, 1);
          if(!$scope.badges[category]) $scope.badges[category] = {};
          _.each(tmpBadge.tags, function (tag) {
            if(!$scope.badges[category][tag.value]) $scope.badges[category][tag.value] = [];
            $scope.badges[category][tag.value].push(badge);
          });
        }
      });
    });
  });

  $scope.capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  $scope.showBadgeInfo = function (tag, badge) {
    if(lastClicked[tag] !== badge.id && $scope.badgeInfoIsCollapsed[tag]) {
      $scope.badgeInfo[tag] = badge;
    } else {
      $scope.badgeInfo[tag] = badge;
      $scope.badgeInfoIsCollapsed[tag] = !$scope.badgeInfoIsCollapsed[tag];
    }
    lastClicked[tag] = badge.id;
  }  
    
}

angular.module('cpZenPlatform')
  .controller('badges-dashboard-controller', ['$scope', 'cdBadgesService', cdBadgesDashboardCtrl]);