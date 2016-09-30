'use strict';

var languageCtrl = function($scope, cdLanguagesService, alertService, $cookies, $translate, $window){

  var DEFAULT_LANGUAGE = 'en_US';

  cdLanguagesService.getLanguages()
    .success(function(languages){
      $scope.languages = languages;

      var language  = ( $cookies.NG_TRANSLATE_LANG_KEY && $cookies.NG_TRANSLATE_LANG_KEY.replace(/\"/g, "")) || $translate.proposedLanguage();

      if(!_.find(languages,{code: language})){
        $translate.useFallbackLanguage(DEFAULT_LANGUAGE);
        language = DEFAULT_LANGUAGE;
        $scope.languageUpdated = true;
      }

      $scope.selectedLanguage = language;

    })
    .error(function(){
      alertService.showError($translate.instant('An error has occured while loading languages'));
    });



  $scope.updateLocale = function(){
    $translate.use($scope.selectedLanguage)
      .then(function () {
        $window.location.reload();
      });
  };
};

angular.module('cpZenPlatform')
  .controller('languageController', ['$scope', 'cdLanguagesService', 'alertService', '$cookies', '$translate', '$window', languageCtrl]);
