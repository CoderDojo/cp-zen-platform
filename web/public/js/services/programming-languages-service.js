'use strict';

function programmingLanguagesService($http) {

  return {
    get: function (languages, onSuccess, onFailure) {
      return $http.get('/programming-languages').then(
        function (responseData) {
          if(languages===null){
            return _.map(responseData.data, function(langue){return langue.text});
          } else {
            var languageImageUrl = _.filter(responseData.data, function (langue) {
              return _.isMatch(languages, langue);
            }).map(function (language) {
              return language.image
            });
            if (angular.isFunction(onSuccess)) {
              onSuccess(languageImageUrl);
            }
          }
        },
        function () {
          if (angular.isFunction(onFailure)) {
            onFailure();
          }
        }
      );
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdProgrammingLanguagesService', ['$http', programmingLanguagesService]);
