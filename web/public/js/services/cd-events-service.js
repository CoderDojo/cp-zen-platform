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
    applyForEvent: function(applyData, win, fail) {
      cdApi.post('events/' + applyData.eventId + '/apply', {applyData: applyData}, win, fail || topfail);
    },
    loadEventApplications: function(eventId, win, fail) {
      cdApi.get('events/applications/' + eventId, win, fail || topfail);
    },
    saveApplication: function(application, win, fail) {
      cdApi.post('events/applications', {application: application}, win, fail || topfail);
    },
    updateApplication: function(application, win, fail) {
      cdApi.put('events/applications/' + application.id, {application:application}, win, fail || topfail);
    },
    searchApplications: function(query, win, fail) {
      cdApi.post('events/applications/search', {query: query}, win, fail || topfail);
    },
    bulkUpdateApplications: function(applications, win, fail) {
      cdApi.post('events/applications/bulk_update', {applications: applications}, win, fail || topfail);
    },
    removeApplicant: function(application, win, fail) {
      cdApi.delete('events/applications/' + application.eventId + '/' + application.id, win, fail || topfail);
    },
    searchAttendance: function(query, win, fail) {
      cdApi.post('events/attendance/search', {query: query}, win, fail || topfail);
    },
    saveAttendance: function(attendance, win, fail) {
      cdApi.post('events/attendance/save', {attendance: attendance}, win, fail || topfail);
    },
    getUserDojosEvents: function(query, win, fail){
      cdApi.post('events/user-dojos-events', {query: query}, win, fail || topfail);
    },
    search: function(query) {
      var deferred = $q.defer();
      cdApi.post('events/search', {query: query}, deferred.resolve, deferred.reject || topfail);
      return deferred.promise;
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdEventsService', ['cdApi', '$q', cdEventsService]);
