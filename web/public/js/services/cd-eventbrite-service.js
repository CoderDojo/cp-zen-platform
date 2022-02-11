'use strict'

function cdEventbriteService(cdApi, $http, $q) {
  return {
    getPublicToken: function() {
      return cdApi.get('eventbrite/ptoken'); //LOOK AT THIS -> cdApi.get talks to cd-eventbrite-service
    },
    authorize: function(dojoId, data) {
      return cdApi.post('dojos/' + dojoId + '/eventbrite/authorisation', data);
    },
    deauthorize: function(dojoId) {
      return cdApi.delete('dojos/' + dojoId + '/eventbrite/authorisation');
    },
    getToken: function(clientId) {
      return $http.get('https://www.eventbrite.com/oauth/authorize?response_type=token&client_id=' + clientId);
    },
    getOrganizationId: function(token) {
      // return cdApi.get('users/me/organisations/?token=' + token);
      console.log(token)
      return $http.get('https://www.eventbriteapi.com/v3/users/me/organizations/?token=' + token);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdEventbriteService', ['cdApi', '$http', '$q', cdEventbriteService]);
