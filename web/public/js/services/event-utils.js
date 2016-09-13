'use strict';

angular.module('cpZenPlatform').factory('eventUtils', ['$translate', function($translate){
  var eventUtils = {};

  eventUtils.nextDateComparator = function (eventA, eventB) {
    var eventANextDate = eventUtils.getFutureDates(eventA.dates)[0];
    var eventBNextDate = eventUtils.getFutureDates(eventB.dates)[0];
    eventANextDate = eventANextDate ? eventANextDate.startTime : null;
    eventBNextDate = eventBNextDate ? eventBNextDate.startTime : null;
    if (eventANextDate < eventBNextDate) {
      return -1;
    } else if (eventANextDate > eventBNextDate) {
      return 1;
    } else {
      return 0;
    }
  }

  eventUtils.isEventInPast = function (dateObj) {
    var now = moment.utc();
    var eventUtcOffset = moment(dateObj.startTime).utcOffset();
    var start = moment.utc(dateObj.startTime).subtract(eventUtcOffset, 'minutes');

    return now.isAfter(start);
  }

  eventUtils.getFutureDates = function (dates) {
    var nextDateIndex = void 0;
    var eventIndex = 0;
    while (eventIndex < dates.length && _.isUndefined(nextDateIndex)) {
      var date = dates[eventIndex];
      if (!eventUtils.isEventInPast(date)) {
        nextDateIndex = eventIndex;
      }
      eventIndex +=1;
    }
    return dates.slice(nextDateIndex);
  }

  eventUtils.getNextDates = function (dates, formattedDates) {
    var futureDates = this.getFutureDates(dates);

    if (futureDates.length > 0 && formattedDates) {
      return formattedDates.slice(dates.length - futureDates.length);
    }
    // Congrats, you called this function upon an past event
    return [];
  }

  eventUtils.getFormattedDates = function (event) {
    var utcOffset = moment().utcOffset();

    var startDate = moment.utc(_.head(event.dates).startTime).subtract(utcOffset, 'minutes').toDate();
    var endDate = moment.utc(_.head(event.dates).endTime).subtract(utcOffset, 'minutes').toDate();

    if(event.type === 'recurring') {
      event.formattedDates = [];
      _.each(event.dates, function (eventDate) {
        event.formattedDates.push(moment.utc(eventDate.startTime).format('Do MMMM YYYY'));
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
      event.startDate = _.first(event.formattedDates);
      event.endDate = _.last(event.formattedDates);
    } else {
      //One-off event
      event.formattedDate = moment(startDate).format('Do MMMM YYYY') + ', ' +
        moment(startDate).format('HH:mm') +  ' - ' +
        moment(endDate).format('HH:mm');
      event.startDate = startDate;
      event.endDate = endDate;
    }
    return event;
  }
  return eventUtils;
}]);
