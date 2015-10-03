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
    loadEventApplications: function(eventId, win, fail) {
      cdApi.get('events/applications/' + eventId, win, fail || topfail);
    },
    saveApplication: function(application, win, fail) {
      cdApi.post('events/applications', {application: application}, win, fail || topfail);
    },
    searchApplications: function(query, win, fail) {
      cdApi.post('events/applications/search', {query: query}, win, fail || topfail);
    },
    removeApplicant: function(application, win, fail) {
      cdApi.delete('events/applications/' + application.eventId + '/' + application.id, win, fail || topfail);
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
      cdApi.post('events/search_sessions', {query: query}, win, fail || topfail);
    },
    bulkApplyApplications: function (applications, win, fail) {
      cdApi.post('events/bulk_apply_applications', {applications: applications}, win, fail || topfail);
    },
    updateApplicationAttendance: function (data, win, fail) {
      cdApi.post('events/update_application_attendance', {data: data}, win, fail || topfail);
    },
    saveSession: function(session, win, fail) {
      cdApi.post('events/save_session', {session: session}, win, fail || topfail);
    },
    cancelSession: function(session, win, fail) {
      cdApi.post('events/cancel_session', {session: session}, win, fail || topfail);
    },
    validateSessionInvitation: function (invitation, win, fail) {
      cdApi.post('events/validate_session_invitation', {invitation: invitation}, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdEventsService', ['cdApi', '$q', cdEventsService]);
