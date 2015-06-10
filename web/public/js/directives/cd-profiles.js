;(function() {
  'use strict';

function listOfParents(){
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/parents-list',
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
    templateUrl: '/profiles/template/children-list'
  };
}

angular
    .module('cpZenPlatform')
    .directive('badgesList', listOfBadges)
    .directive('childrenList', listOfChildren)
    .directive('parentsList', listOfParents);
 
}());