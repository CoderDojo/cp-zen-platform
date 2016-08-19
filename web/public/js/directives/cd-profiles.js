;(function() {
  'use strict';

function listOfParents(){
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/parents-list',
    controller: ['$scope', '$state', function($scope, $state) {
      var watcher = $scope.$watch('profile.resolvedParents', function(newParents){
        if(!_.isEmpty(newParents)){
          _.each($scope.profile.resolvedParents, function(user, index){
            $scope.profile.resolvedParents[index].href = $state.href('user-profile', {userId: user.userId});
            $scope.profile.resolvedParents[index].picture = '/api/2.0/profiles/' + user.id + '/avatar_img';
            $scope.profile.resolvedParents[index].caption = user.name;
          });
        }
      });
      $scope.$on('$destroy', function(){
        watcher();
      });
    }]
  };
}

function listOfBadges(){
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/badges-list'
  };
}

function listOfChildren(){
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/children-list',
    controller: ['$scope', '$state', function($scope, $state) {
      var watcher = $scope.$watch('profile.resolvedChildren', function(newChildren){
        if(!_.isEmpty(newChildren)){
          _.each($scope.profile.resolvedChildren, function(user, index){
            $scope.profile.resolvedChildren[index].href = $state.href('user-profile', {userId: user.userId});
            $scope.profile.resolvedChildren[index].picture = '/api/2.0/profiles/' + user.id + '/avatar_img';
            $scope.profile.resolvedChildren[index].caption = user.name;
          });
        }
      });
      $scope.$on('$destroy', function(){
        watcher();
      });
    }]
  };
}

function generalInfo(){
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/general-info'
  };
}

function listOfLanguagesSpoken(){
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/languages-spoken-list'
  };
}

function listOfProgrammingLanguages(){
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/programming-languages-list'
  };
}

function listOfProjects(){
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/projects-list'
  }
}

function bio() {
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/bio'
  };
}

function listOfDojos() {
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/dojo-list',
    controller: ['$scope', 'cdDojoService', 'dojoUtils', '$q', function($scope, cdDojoService, dojoUtils, $q) {
      var watcher = $scope.$watch('profile.dojos', function(newDojos){
        if(!_.isEmpty(newDojos)){
          var promises = [];
          _.each($scope.profile.dojos, function(dojo, index){
            cdDojoService.getAvatar(dojo.id).then(function(url){
              $scope.profile.dojos[index].href = dojoUtils.getDojoURL(dojo);
              $scope.profile.dojos[index].caption = dojo.name;
              $scope.profile.dojos[index].picture = url;
            });
          });
        }
      });
      $scope.$on('$destroy', function(){
        watcher();
      });
    }]
  };
}

angular
  .module('cpZenPlatform')
  .directive('projectsList', listOfProjects)
  .directive('programmingLanguagesList', listOfProgrammingLanguages)
  .directive('languagesSpokenList', listOfLanguagesSpoken)
  .directive('badgesList', listOfBadges)
  .directive('childrenList', listOfChildren)
  .directive('generalInfo', generalInfo)
  .directive('parentsList', listOfParents)
  .directive('bio', bio)
  .directive('dojoList', listOfDojos);

}());
