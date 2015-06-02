'use strict';

function languagesService($http) {

  return {
    getLanguages: function(){
      return $http.get('/locale/languages');
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdLanguagesService', ['$http', languagesService]);