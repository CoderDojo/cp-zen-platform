'use strict';

function programmingLanguagesService($http) {

  return {
    get: function(){
      return $http.get('/programming-languages');
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdProgrammingLanguagesService', ['$http', programmingLanguagesService]);