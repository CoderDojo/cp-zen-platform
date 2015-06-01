'use strict';

var languageCtrl = function($scope, cdLanguagesService, alertService, $cookies, $translate, $window){
  $scope.selectedLanguage = $cookies['NG_TRANSLATE_LANG_KEY'].replace(/\"/g, "");

  cdLanguagesService.getLanguages()
    .success(function(languages){
      $scope.languages = languages;
    })
    .error(function(){
      alertService.showError($translate.instant('An error has occured while loading languages'));
    });
    


  $scope.updateLocale = function(){
    $scope.languageUpdated = true;
    $translate.use($scope.selectedLanguage);
  };

  $scope.$watch(function() { return $cookies.NG_TRANSLATE_LANG_KEY; }, function(newValue) {
    if($scope.languageUpdated){
      $window.location.reload();
      $scope.languageUpdated = false;
    }
  });
};

angular.module('cpZenPlatform')
  .controller('language', ['$scope', 'cdLanguagesService', 'alertService', '$cookies', '$translate', '$window', languageCtrl]);
