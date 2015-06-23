'use strict';

function cdEventsService(cdApi, $q){
  function topfail(err){
    console.log(err);
  }

  return {
    getEvent: function(id, win, fail) {
      cdApi.get('events/' + id, win, fail || topfail);
    },
    saveEvent: function(eventInfo, win, fail){
      cdApi.post('save-event', {eventInfo: eventInfo}, win, fail || topfail);
    },
    list: function(query, win, fail){
      cdApi.post('events', {query: query}, win, fail || topfail);
    },
    search: function(search) {
      return $q(function(resolve, reject) {
        cdApi.post('events/search', {search: search}, resolve, reject);
      });
    },
    applyForEvent: function(eventId, win, fail) {
      cdApi.get('events/' + eventId + '/apply', win, fail || topfail);
    },
    loadEventApplications: function(eventId, win, fail) {
      cdApi.get('events/applications/' + eventId, win, fail || topfail);
    },
    updateApplication: function(application, win, fail) {
      cdApi.put('events/applications/' + application.id, {application:application}, win, fail || topfail);
    },
    searchApplications: function(search) {
      return $q(function(resolve, reject) {
        cdApi.post('events/applications/search', {search: search}, resolve, reject);
      });
    },
    bulkUpdateApplications: function(applications, win, fail) {
      cdApi.post('events/applications/bulk_update', {applications: applications}, win, fail || topfail);
    },
    removeApplicant: function(application, win, fail) {
      cdApi.delete('events/applications/' + application.eventId + '/' + application.id, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdEventsService', ['cdApi', '$q', cdEventsService]);
