'use strict';

angular.module('cpZenPlatform').factory('eventUtils', ['$translate', function($translate){
  var eventUtils = {};
  eventUtils.isEventInPast = function(dateObj){
    var now = moment.utc();
    var eventUtcOffset = moment(dateObj.startTime).utcOffset();
    var start = moment.utc(dateObj.startTime).subtract(eventUtcOffset, 'minutes');

    return now.isAfter(start);
  }

  eventUtils.getFormattedDates = function(event) {
    var utcOffset = moment().utcOffset();

    var startDate = moment.utc(_.head(event.dates).startTime).subtract(utcOffset, 'minutes').toDate();
    var endDate = moment.utc(_.head(event.dates).endTime).subtract(utcOffset, 'minutes').toDate();

    if(event.type === 'recurring') {
      event.formattedDates = [];
      _.each(event.dates, function (eventDate) {
        event.formattedDates.push(moment.utc(eventDate.startTime).format('Do MMMM YY'));
      });

      event.day = moment(startDate).format('dddd');
      event.time = moment(startDate).format('HH:mm') + ' - ' + moment(endDate).format('HH:mm');

      if(event.recurringType === 'weekly') {
        event.formattedRecurringType = $translate.instant('Weekly');
        event.formattedDate = $translate.instant('Weekly') + " " +
          $translate.instant('on') + " " + $translate.instant(event.day) + " " +
          $translate.instant('at') + " " + event.time;
      } else {
        event.formattedRecurringType = $translate.instant('Every two weeks');
        event.formattedDate = $translate.instant('Every two weeks') + " " +
          $translate.instant('on') + " " + $translate.instant(event.day) + " " +
          $translate.instant('at') + " " + event.time;
      }
    } else {
      //One-off event
      event.formattedDate = moment(startDate).format('Do MMMM YY') + ', ' +
        moment(startDate).format('HH:mm') +  ' - ' +
        moment(endDate).format('HH:mm');
      event.startDate = startDate;
      event.endDate = endDate;
    }
    return event;
  }
  return eventUtils;
}]);
