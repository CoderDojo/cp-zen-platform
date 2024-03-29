'use strict'

function cdEventbriteService(cdApi, $http, $q) {
  return {
    getPublicToken: function() {
      return cdApi.get('eventbrite/ptoken');
    },
    authorize: function(dojoId, orgId, data) {
      return cdApi.post('dojos/' + dojoId + '/eventbrite/authorisation/' + orgId, data);
    },
    deauthorize: function(dojoId) {
      return cdApi.delete('dojos/' + dojoId + '/eventbrite/authorisation');
    },
    getToken: function(clientId) {
      return $http.get('https://www.eventbrite.com/oauth/authorize?response_type=token&client_id=' + clientId);
    },
    getOrganisations: function(code) {
      return cdApi.get('eventbrite/organisations/' + code);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdEventbriteService', ['cdApi', '$http', '$q', cdEventbriteService]);
