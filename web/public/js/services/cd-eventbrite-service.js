'use strict'

function cdEventbriteService(cdApi, $http, $q) {
  return {
    getPublicToken: function() {
      return cdApi.get('eventbrite/ptoken');
    },
    authorize: function(dojoId, data) {
      return cdApi.post('dojos/' + dojoId + '/eventbrite/authorisation', data);
    },
    deauthorize: function(dojoId) {
      return cdApi.delete('dojos/' + dojoId + '/eventbrite/authorisation');
    },
    getToken: function(clientId) {
      return $http.get('https://www.eventbrite.com/oauth/authorize?response_type=token&client_id=' + clientId);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdEventbriteService', ['cdApi', '$http', '$q', cdEventbriteService]);
