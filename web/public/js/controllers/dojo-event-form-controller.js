/* global google */
(function() {
  'use strict';

  function getEveryTargetWeekdayInDateRange(startDateTime, endDateTime, targetWeekday, eventType) {
    var currentDate = startDateTime;
    var dates = [];
    var biWeeklyEventSwitch = false;

    // this function calculates the start time and end time for each recurring event occurrence.
    // the result of this function will be finally saved in the DB
    function calculateDatesObj(startDateTime, endDateTime){
      var date = {};
      var startDateTimeOffset = moment(startDateTime.toISOString()).utcOffset();
      var endDateTimeOffset = moment(endDateTime.toISOString()).utcOffset();
      date.startTime = moment.utc(startDateTime).add(startDateTimeOffset, 'minutes').toDate();
      var mEventDate = moment.utc(startDateTime);
      var mEventLastDate = moment.utc(endDateTime).add(endDateTimeOffset, 'minutes');
      date.endTime = moment.utc([ mEventDate.get('year'), mEventDate.get('month'), mEventDate.date(),
        mEventLastDate.get('hour'), mEventLastDate.get('minute'), mEventLastDate.get('second'), mEventLastDate.get('millisecond') ]).toDate();
      return date;
    }

    if(eventType === 'one-off') {
      dates.push(calculateDatesObj(currentDate, endDateTime));
    } else {
      while (currentDate <= endDateTime) {
        currentDate = moment.utc(new Date(currentDate)).toDate();

        if (currentDate.getDay() === targetWeekday) {
          if (eventType === 'weekly') {
            dates.push(calculateDatesObj(currentDate, endDateTime));
          } else {
            if (!biWeeklyEventSwitch) {
              dates.push(calculateDatesObj(currentDate, endDateTime));
              biWeeklyEventSwitch = true;
            } else {
              biWeeklyEventSwitch = false;
            }
          }
        }

        currentDate = moment.utc(currentDate).add(1, 'days');
      }
    }

    return dates;
  }

  function goToManageDojoEvents($state, usSpinnerService, dojoId) {
    if(usSpinnerService) {
      usSpinnerService.stop('create-event-spinner');
    }
    $state.go('my-dojos.manage-dojo-events', {
      dojoId: dojoId
    });
  }

  function goToMyDojos($state, usSpinnerService) {
    usSpinnerService.stop('create-event-spinner');
    $state.go('my-dojos');
  }

  function fixEventDates(newDate, oldDate){
    newDate = moment.utc(newDate);
    oldDate = moment.utc(oldDate);
    return moment.utc([ newDate.get('year'),newDate.get('month'), newDate.date(),
                        oldDate.get('hour'), oldDate.get('minute'), oldDate.get('second'), oldDate.get('millisecond') ]);
  }

  function fixEventTime(newTime, date){
    newTime = moment.utc(newTime);
    date = moment.utc(date);
    return moment.utc([ date.get('year'), date.get('month'), date.date(),
      newTime.get('hour'), newTime.get('minute'), newTime.get('second'), newTime.get('millisecond') ]);
  }

  function dojoEventFormCtrl($scope, $stateParams, $state, cdEventsService, cdDojoService, cdUsersService, auth, $translate, cdLanguagesService, usSpinnerService, alertService, utilsService, ticketTypes, currentUser) {
    var dojoId = $stateParams.dojoId;
    var now = moment.utc().toDate();
    var defaultEventTime = moment.utc(now).add(2, 'hours').toDate();
    var defaultEventEndTime = moment.utc(now).add(3, 'hours').toDate();
    $scope.today = moment.utc().toDate();
	  $scope.ticketTypes = ticketTypes.data || [];

    _.each($scope.ticketTypes, function (ticketType) {
      ticketType.title = $translate.instant(ticketType.title);
    });

    $scope.eventInfo = {};
    $scope.eventInfo.dojoId = dojoId;
    $scope.eventInfo.public = false;
    $scope.eventInfo.recurringType = 'weekly';
    $scope.eventInfo.sessions = [{name: null, tickets:[{name: null, type: null, quantity: null}]}];

    $scope.eventInfo.date = defaultEventTime;
    $scope.eventInfo.toDate = defaultEventEndTime;

    $scope.eventInfo.startTime = defaultEventTime;
    $scope.eventInfo.startTime.setMinutes(0);
    $scope.eventInfo.startTime.setSeconds(0);

    $scope.eventInfo.endTime = defaultEventEndTime;
    $scope.eventInfo.endTime.setMinutes(0);
    $scope.eventInfo.endTime.setSeconds(0);

    $scope.eventInfo.fixedStartDateTime = $scope.eventInfo.date;
    $scope.eventInfo.fixedEndDateTime = $scope.eventInfo.toDate;

    $scope.datepicker = {};
    $scope.datepicker.minDate = now;

    $scope.$watch('eventInfo.date', function (date) {
      $scope.eventInfo.fixedStartDateTime = fixEventDates(date, $scope.eventInfo.fixedStartDateTime);
      $scope.eventInfo.startTime = $scope.eventInfo.fixedStartDateTime;
      $scope.eventInfo.endTime = fixEventDates($scope.eventInfo.fixedStartDateTime, $scope.eventInfo.fixedEndDateTime);
    });

    $scope.$watch('eventInfo.toDate', function (toDate) {
      $scope.eventInfo.fixedEndDateTime = fixEventDates(toDate, $scope.eventInfo.fixedEndDateTime);
      $scope.eventInfo.endTime = $scope.eventInfo.fixedEndDateTime;
    });

    $scope.$watch('eventInfo.startTime', function (startTime) {
      $scope.eventInfo.fixedStartDateTime = fixEventTime(startTime, $scope.eventInfo.fixedStartDateTime);
    });

    $scope.$watch('eventInfo.endTime', function (endTime) {
      $scope.eventInfo.fixedEndDateTime = fixEventTime(endTime, $scope.eventInfo.fixedEndDateTime);
    });

    $scope.toggleDatepicker = function($event, isOpen) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.datepicker[isOpen] = !$scope.datepicker[isOpen];
    };

    $scope.timepicker = {};
    $scope.timepicker.hstep = 1;
    $scope.timepicker.mstep = 15;
    $scope.timepicker.ismeridian = true;

    $scope.weekdayPicker = {};
    $scope.weekdayPicker.weekdays = [{
      id: 0,
      name: $translate.instant('Sunday')
    }, {
      id: 1,
      name: $translate.instant('Monday')
    }, {
      id: 2,
      name: $translate.instant('Tuesday')
    }, {
      id: 3,
      name: $translate.instant('Wednesday')
    }, {
      id: 4,
      name: $translate.instant('Thursday')
    }, {
      id: 5,
      name: $translate.instant('Friday')
    }, {
      id: 6,
      name: $translate.instant('Saturday')
    }];

    $scope.weekdayPicker.selection = $scope.weekdayPicker.weekdays[0];

    $scope.searchCity = function($select) {
      return utilsService.getPlaces($scope.eventInfo.country.alpha2, $select).then(function (data) {
        $scope.cities = data;
      }, function (err) {
        $scope.cities = [];
        console.error(err);
      });
    };

    $scope.eventInfo.invites = [];

    $scope.cancel = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      goToManageDojoEvents($state, null, dojoId);
    };

    $scope.addSession = function () {
      if($scope.eventInfo.sessions.length === 20) return alertService.showError($translate.instant('You can only create a max of 20 sessions/rooms'));
      var session = {
        name: null,
        tickets: [{name: null, type: null, quantity: null}]
      };
      $scope.eventInfo.sessions.push(session);
    };

    $scope.addTicket = function (session) {
      if(session.tickets.length === 20) return alertService.showError($translate.instant('You can only create a max of 20 ticket types'));
      var ticket = {
        name: null,
        type: null,
        quantity: 0
      };
      session.tickets.push(ticket);
    };

    $scope.removeTicket = function ($index, session) {
      if(session.tickets.length === 1) return alertService.showAlert($translate.instant('Your event must contain at least one ticket.'));
      return session.tickets.splice($index, 1);
    };

    $scope.removeSession = function ($index) {
      if($scope.eventInfo.sessions.length === 1) return alertService.showAlert($translate.instant('Your event must contain at least one session.'));
      return $scope.eventInfo.sessions.splice($index, 1);
    };

    $scope.totalSessionCapacity = function (session) {
      var total = 0;
      _.each(session.tickets, function (ticket) {
        if(ticket.type !== 'other') total += ticket.quantity;
      });
      return total;
    };

    $scope.totalEventCapacity = function () {
      var total = 0;
      _.each($scope.eventInfo.sessions, function (session) {
        total += $scope.totalSessionCapacity(session);
      });
      return total;
    };

    $scope.submit = function(eventInfo) {
      usSpinnerService.spin('create-event-spinner');

      if($scope.googleMaps && $scope.googleMaps.marker) {
        var eventPosition = {
          lat: $scope.googleMaps.marker.getPosition().lat(),
          lng: $scope.googleMaps.marker.getPosition().lng()
        };

        // Extend eventInfo
        eventInfo.position = eventPosition;
      }

      eventInfo.status = eventInfo.publish ? 'published' : 'saved';
      delete eventInfo.publish;
      eventInfo.userType = eventInfo.userType && eventInfo.userType.name ? eventInfo.userType.name : '';

      if(!_.isEmpty(eventInfo.invites)) {
        eventInfo.emailSubject = $translate.instant('Event Invitation');
      }

      var isDateRange = !moment.utc(eventInfo.toDate).isSame(eventInfo.date, 'day');

      if (eventInfo.type === 'recurring' && isDateRange) {
        // Extend eventInfo
        if(eventInfo.recurringType === 'weekly') {
          eventInfo.dates = getEveryTargetWeekdayInDateRange(
            eventInfo.fixedStartDateTime,
            eventInfo.fixedEndDateTime,
            $scope.weekdayPicker.selection.id,
            'weekly'
          );
        } else {
          eventInfo.dates = getEveryTargetWeekdayInDateRange(
            eventInfo.fixedStartDateTime,
            eventInfo.fixedEndDateTime,
            $scope.weekdayPicker.selection.id,
            'biweekly'
          );
        }
      } else {
        eventInfo.dates = getEveryTargetWeekdayInDateRange(
          eventInfo.fixedStartDateTime,
          eventInfo.fixedEndDateTime,
          null,
          'one-off'
        );
      }

      if(!$scope.dojoInfo) {
        loadDojo(function(err){
          if(err) {
            alertService.showError($translate.instant('An error has occurred while loading Dojo') + ' ' + err);
            goToMyDojos($state, usSpinnerService, dojoId)
          }
          if ($scope.dojoInfo.verified === 1 && $scope.dojoInfo.stage !== 4) {
            cdEventsService.saveEvent(
              eventInfo,
              function (response) {
                if(response.ok === false) {
                  alertService.showError($translate.instant(response.why));
                }
                goToManageDojoEvents($state, usSpinnerService, dojoId)
              },
              function(err){
                alertService.showError($translate.instant('Error setting up event') + ' ' + err);
                goToMyDojos($state, usSpinnerService, dojoId)
              }
            );
          } else {
            alertService.showError($translate.instant('Error setting up event'));
            goToMyDojos($state, usSpinnerService, dojoId)
          }
        })
      } else {
        if ($scope.dojoInfo.verified === 1 && $scope.dojoInfo.stage !== 4) {
          cdEventsService.saveEvent(
            eventInfo,
            function (response) {
              if(response.ok === false) {
                alertService.showError($translate.instant(response.why));
              }
              goToManageDojoEvents($state, usSpinnerService, dojoId)
            },
            function (err){
              alertService.showError($translate.instant('Error setting up event') + ' ' + err);
              goToMyDojos($state, usSpinnerService, dojoId)
            }
          );
        } else {
          alertService.showError($translate.instant('Error setting up event'));
          goToMyDojos($state, usSpinnerService, dojoId)
        }
      }
    };

    function addMap(eventPosition) {
      var markerPosition = new google.maps.LatLng(eventPosition.lat, eventPosition.lng);

      $scope.googleMaps = {
        mapOptions: {
          center: markerPosition,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        onTilesLoaded: onTilesLoaded
      };

      function onTilesLoaded() {
        var map = $scope.googleMaps.map;

        $scope.googleMaps.marker = new google.maps.Marker({
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: markerPosition
        });

        google.maps.event.clearListeners(map, 'tilesloaded');
      }
    }


    function loadDojo(done) {
      cdDojoService.load(dojoId, function(dojo) {

        if(dojo.place && dojo.place.toponymName){
          dojo.place.nameWithHierarchy = dojo.place.toponymName;
          delete dojo.place.toponymName;
        }
        $scope.eventInfo.country = dojo.country;
        $scope.eventInfo.city = dojo.place;
        $scope.eventInfo.address = dojo.address1;

        var position = [];
        if(dojo.coordinates) {
          position = dojo.coordinates.split(',');
        }

        $scope.dojoInfo = dojo;

        if(position && position.length === 2 && !isNaN(utilsService.filterFloat(position[0])) && !isNaN(utilsService.filterFloat(position[1]))) {
          addMap({
            lat: parseFloat(position[0]),
            lng: parseFloat(position[1])
          });
        } else if($scope.dojoInfo.geoPoint && $scope.dojoInfo.geoPoint.lat && $scope.dojoInfo.geoPoint.lon) {
          //add map using coordinates from geopoint if possible
          addMap({
            lat: $scope.dojoInfo.geoPoint.lat,
            lng: $scope.dojoInfo.geoPoint.lon
          })
        } else { //add empty map
          cdDojoService.loadCountriesLatLongData(function(countries){
            var country = countries[dojo.alpha2];
            addMap({
              lat: country[0],
              lng: country[1]
            })
          }, done)
        }

        done(null, dojo);

      }, done);
    }

    function loadCurrentUser(done) {
      auth.get_loggedin_user(function(user) {
        $scope.eventInfo.userId = user.id;
        done(null, user);
      }, done);
    }

    function validateEventRequest(done) {
      cdDojoService.getUsersDojos({userId: currentUser.data.id, dojoId: dojoId}, function (usersDojos) {
        if(_.isEmpty(usersDojos)) return done(new Error('No permissions found'));
        var ticketingPermissionFound = _.find(usersDojos[0].userPermissions, function (permission) {
          return permission.name === 'ticketing-admin';
        });
        if(!ticketingPermissionFound) return done(new Error('You must have the ticketing admin permission to edit a Dojo event'));
        return done();
      });
    }

    function loadDojoUsers(done) {
      cdDojoService.loadDojoUsers({
        dojoId: dojoId,
        limit$: 'NULL'
      }, function(users) {
        $scope.dojoUsers = users;
        done(null, users);
      }, done);
    }

    function loadUserTypes(done) {
      cdUsersService.getInitUserTypes(function(userTypes) {
        _.each(userTypes, function (userType) {
          userType.title = $translate.instant(userType.title);
        });
        userTypes.push({title:$translate.instant('Everyone'), name:'all-user-types'});
        $scope.eventInfo.userTypes = userTypes;
        done(null, userTypes);
      }, done);
    }

    function loadEvent(done) {
      var eventId = $stateParams.eventId;

      cdEventsService.getEvent(eventId, function(event) {
        $scope.isEditMode = true;
        
        var startTime = _.first(event.dates).startTime || moment.utc().toISOString();
        var endTime = _.last(event.dates).endTime || moment.utc().toISOString();

        var startDateUtcOffset = moment(startTime).utcOffset();
        var endDateUtcOffset = moment(endTime).utcOffset();

        event.startTime = moment(startTime).subtract(startDateUtcOffset, 'minutes').toDate();
        event.endTime = moment(endTime).subtract(endDateUtcOffset, 'minutes').toDate();
        event.createdAt = new Date(event.createdAt);
        event.date = new Date(startTime);
        var lastEventOcurrance = _.last(event.dates).startTime || moment.utc().toISOString();
        event.toDate = new Date(lastEventOcurrance);

        var eventDay =  moment.utc(_.first(event.dates).startTime, 'YYYY-MM-DD HH:mm:ss').format('dddd');
        $scope.weekdayPicker.selection = _.find($scope.weekdayPicker.weekdays, function (dayObject) {
          return dayObject.name === $translate.instant(eventDay);
        });

        $scope.eventInfo.fixedStartDateTime = event.startTime;
        $scope.eventInfo.fixedEndDateTime = event.endTime;

        $scope.eventInfo = _.assign($scope.eventInfo, event);
        $scope.eventInfo.userType = _.where($scope.eventInfo.userTypes, {name: $scope.eventInfo.userType})[0];
        $scope.pastEvent = isEventInPast(_.last(event.dates));

        done(null, event);
      }, done);
    }


    function loadSessions(done) {
      var eventId = $stateParams.eventId;
      cdEventsService.searchSessions({eventId: eventId}, function (sessions) {
        $scope.eventInfo.sessions = sessions;
      }, function (err) {
        console.error(err);
      });
    }

    function isEventInPast(dateObj) {
      var now = moment.utc();
      var eventUtcOffset = moment(dateObj.startTime).utcOffset();
      var start = moment.utc(dateObj.startTime).subtract(eventUtcOffset, 'minutes');

      return now.isAfter(start);
    }

    if ($stateParams.eventId) {
      if(_.isEmpty(currentUser.data)) return $state.go('error-404-no-headers');

      return async.series([
        validateEventRequest,
        loadDojoUsers,
        loadUserTypes,
        loadEvent,
        loadSessions
      ], function(err, results) {
        if (err) {
          console.error(err);
          return $state.go('error-404-no-headers');
        } else {
          var eventPosition = results[3].position;
          addMap(eventPosition);
        }
      });
    } else {
      cdEventsService.search({dojoId: dojoId, sort$: {createdAt: 1}, limit$: 1}).then(function (events) {
        var latestEvent = events[0];
        $scope.eventInfo.ticketApproval = latestEvent.ticketApproval;
      });
    }

    async.parallel([
      validateEventRequest,
      loadDojo,
      loadCurrentUser,
      loadDojoUsers,
      loadUserTypes
    ], function(err, results) {
      if (err) {
        console.error(err);
        return $state.go('error-404-no-headers');
      }
    });
  }

  angular.module('cpZenPlatform')
    .controller('dojo-event-form-controller', [
      '$scope',
      '$stateParams',
      '$state',
      'cdEventsService',
      'cdDojoService',
      'cdUsersService',
      'auth',
      '$translate',
      'cdLanguagesService',
      'usSpinnerService',
      'alertService',
      'utilsService',
      'ticketTypes',
      'currentUser',
      dojoEventFormCtrl
    ]);
})();
