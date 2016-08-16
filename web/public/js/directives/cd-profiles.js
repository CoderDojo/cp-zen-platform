;(function() {
  'use strict';

function listOfParents(){
  return {
    restrict: 'E',
    templateUrl: '/profiles/template/parents-list'
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
    templateUrl: '/profiles/template/dojo-list'
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
