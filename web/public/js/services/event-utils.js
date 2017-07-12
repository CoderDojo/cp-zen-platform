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

    var mStartDate = moment.utc(_.head(event.dates).startTime);
    var mEndDate = moment.utc(_.head(event.dates).endTime);
    var startDate = mStartDate.subtract(mStartDate.utcOffset(), 'minutes');
    var endDate = mEndDate.subtract(mEndDate.utcOffset(), 'minutes');

    event.formattedDates = [];
    _.each(event.dates, function (eventDate) {
      event.formattedDates.push(moment.utc(eventDate.startTime).format('Do MMMM YYYY'));
    });

    if (event.type === 'recurring') {
      event.day = mStartDate.format('dddd');
      event.time = mStartDate.format('HH:mm') + ' - ' + mEndDate.format('HH:mm');

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
      event.formattedStartDate = mStartDate.format('Do MMMM YYYY');
      event.formattedStartTime = mStartDate.format('HH:mm');
      event.formattedEndTime = mEndDate.format('HH:mm');
      event.formattedDate = event.formattedStartDate + ', ' +
        event.formattedStartTime + ' - ' +
        event.formattedEndTime
      event.startDate = startDate.toDate();
      event.endDate = endDate.toDate();
    }
    return event;
  }

  eventUtils.canBook = function (publicEvent, privateDojo, isDojoMember) {
    var bookable = false;
    if (privateDojo) { // The dojo is private, only members can join
      bookable = isDojoMember;
    } else { // Public event are freely joinable, private events requires you to be a member
      bookable = publicEvent || isDojoMember;
    }
    return bookable;
  };
  return eventUtils;
}]);
