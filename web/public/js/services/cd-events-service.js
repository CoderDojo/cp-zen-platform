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
    searchApplications: function(search, win, fail) {
      cdApi.post('events/applications/search', {search: search}, win, fail || topfail);
    },
    bulkUpdateApplications: function(applications, win, fail) {
      cdApi.post('events/applications/bulk_update', {applications: applications}, win, fail || topfail);
    },
    removeApplicant: function(application, win, fail) {
      cdApi.delete('events/applications/' + application.eventId + '/' + application.id, win, fail || topfail);
    },
    searchAttendance: function(search, win, fail) {
      cdApi.post('events/attendance/search', {search: search}, win, fail || topfail);
    },
    saveAttendance: function(attendance, win, fail) {
      cdApi.post('events/attendance/save', {attendance: attendance}, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdEventsService', ['cdApi', '$q', cdEventsService]);
