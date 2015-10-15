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
      cdApi.post('events/save', {eventInfo: eventInfo}, win, fail || topfail);
    },
    list: function(query, win, fail){
      cdApi.post('events', {query: query}, win, fail || topfail);
    },
    loadEventApplications: function(eventId, win, fail) {
      cdApi.get('events/applications/' + eventId, win, fail || topfail);
    },
    saveApplication: function(application, win, fail) {
      cdApi.post('events/application', {application: application}, win, fail || topfail);
    },
    searchApplications: function(query, win, fail) {
      cdApi.post('events/applications/search', {query: query}, win, fail || topfail);
    },
    removeApplicant: function(application, win, fail) {
      cdApi.delete('events/' + application.eventId + '/applications/' +  application.id, win, fail || topfail);
    },
    getUserDojosEvents: function(query, win, fail){
      cdApi.post('events/user-dojos-events', {query: query}, win, fail || topfail);
    },
    search: function(query) {
      var deferred = $q.defer();
      cdApi.post('events/search', {query: query}, deferred.resolve, deferred.reject || topfail);
      return deferred.promise;
    },
    ticketTypesPromise: function () {
      var deferred = $q.defer();
      cdApi.get('events/tickets/types', deferred.resolve, deferred.reject || topfail);
      return deferred.promise;
    },
    searchSessions: function (query, win, fail) {
      cdApi.post('events/sessions/search', {query: query}, win, fail || topfail);
    },
    bulkApplyApplications: function (applications, win, fail) {
      cdApi.post('events/bulk-apply-applications', {applications: applications}, win, fail || topfail);
    },
    updateApplicationAttendance: function (data, win, fail) {
      cdApi.post('events/update-application-attendance', {data: data}, win, fail || topfail);
    },
    cancelSession: function(session, win, fail) {
      cdApi.post('events/session/cancel', {session: session}, win, fail || topfail);
    },
    validateSessionInvitation: function (invitation, win, fail) {
      cdApi.post('events/session/validate-invitation', {invitation: invitation}, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdEventsService', ['cdApi', '$q', cdEventsService]);
