'use strict';

var languageCtrl = function($scope, cdLanguagesService, alertService, $cookies, $translate, $window,){
  console.log("translate", $translate.use());
  $scope.selectedLanguage = ( $cookies['NG_TRANSLATE_LANG_KEY'] && $cookies['NG_TRANSLATE_LANG_KEY'].replace(/\"/g, "")) || $translate.proposedLanguage();
  console.log($http.defaults.headers);

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
  .controller('languageController', ['$scope', 'cdLanguagesService', 'alertService', '$cookies', '$translate', '$window', languageCtrl]);
