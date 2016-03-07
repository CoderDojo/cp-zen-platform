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
    $state.go('manage-dojo-events', {
      dojoId: dojoId
    });
  }

  function goToManageDojoEvent($state, usSpinnerService, dojoId, eventId) {
    if(usSpinnerService) {
      usSpinnerService.stop('create-event-spinner');
    }
    $state.go('manage-applications', {
      dojoId: dojoId,
      eventId: eventId
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

  function dojoEventFormCtrl($scope, $stateParams, $state, $sce, $localStorage, $modal, cdEventsService, cdDojoService, cdUsersService, auth, $translate, cdLanguagesService, usSpinnerService, alertService, utilsService, ticketTypes, currentUser) {
    var dojoId = $stateParams.dojoId;
    var now = moment.utc().toDate();
    var defaultEventTime = moment.utc(now).add(2, 'hours').toDate();
    var defaultEventEndTime = moment.utc(now).add(3, 'hours').toDate();
    $scope.today = moment.utc().toDate();
	  $scope.ticketTypes = ticketTypes.data || [];
    $scope.ticketTypesTooltip = '';

    _.each($scope.ticketTypes, function (ticketType, index) {
      ticketType.title = $translate.instant(ticketType.title);
      if(index !== 0) {
        $scope.ticketTypesTooltip += '<br>' + $translate.instant(ticketType.tooltip);
      } else {
        $scope.ticketTypesTooltip += $translate.instant(ticketType.tooltip);
      }
    });

    $scope.ticketTypesTooltip = $sce.trustAsHtml($scope.ticketTypesTooltip);

    $scope.eventInfo = {};
    $scope.eventInfo.dojoId = dojoId;
    $scope.eventInfo.public = true;
    $scope.eventInfo.prefillAddress = false;
    $scope.eventInfo.recurringType = 'weekly';
    $scope.eventInfo.sessions = [{name: null, tickets:[{name: null, type: null, quantity: 0}]}];

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
    $scope.hasAccess = true;


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

    $scope.updateLocalStorage = function (item, value) {
      if(!_.isEmpty(currentUser.data) && !$stateParams.eventId) {
        if(!$localStorage[currentUser.data.id]) $localStorage[currentUser.data.id] = {};
        if(!$localStorage[currentUser.data.id][dojoId]) $localStorage[currentUser.data.id][dojoId] = {};
        if(!$localStorage[currentUser.data.id][dojoId].eventForm) $localStorage[currentUser.data.id][dojoId].eventForm = {};

        // what if the actual value is 'false' or 'null'
        if(value === false || value === null || value) {
          $localStorage[currentUser.data.id][dojoId].eventForm[item] = value;
        }
      }
    };

    var deleteLocalStorage = function () {
      if(!_.isEmpty(currentUser.data)) {
        if($localStorage[currentUser.data.id] && $localStorage[currentUser.data.id][dojoId] && $localStorage[currentUser.data.id][dojoId].eventForm) {
          delete $localStorage[currentUser.data.id][dojoId].eventForm;
        }
      }
    }

    $scope.getLocationFromAddress = function(eventInfo, cb) {
      utilsService.getEventLocationFromAddress(eventInfo).then(function (data) {
        $scope.googleMaps.mapOptions.center = new google.maps.LatLng(data.lat, data.lng);
        $scope.googleMaps.map.panTo($scope.googleMaps.mapOptions.center);
        $scope.googleMaps.marker.setMap(null);
        $scope.googleMaps.marker = new google.maps.Marker({
          map: $scope.googleMaps.map,
          position: $scope.googleMaps.mapOptions.center
        });
        eventInfo.position = {
          lat: data.lat,
          lng: data.lng
        };
        if(cb) cb();
      }, function (err) {
        if(err) console.error(err);
        alertService.showError($translate.instant('Please add the event location manually by clicking on the map.'));
        if(cb) cb();
      });
    };

    $scope.validateSessions = function (sessions) {
      return sessions.length !== 0;
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

    $scope.searchCity = function($select) {
      if($scope.hasAccess) {
        return utilsService.getPlaces($scope.eventInfo.country.alpha2, $select).then(function (data) {
          $scope.cities = data;
        }, function (err) {
          $scope.cities = [];
          console.error(err);
        });
      }
    };

    $scope.prefillDojoAddress = function() {
      if($scope.eventInfo.prefillAddress) {
        $scope.eventInfo.city = $scope.eventInfo.dojoCity;
        $scope.eventInfo.address = $scope.eventInfo.dojoAddress;

        $scope.updateLocalStorage('city', $scope.eventInfo.dojoCity);
        $scope.updateLocalStorage('address', $scope.eventInfo.dojoAddress);
        $scope.updateLocalStorage('prefillAddress', true);
        return;
      }

      $scope.updateLocalStorage('prefillAddress', false);
      $scope.eventInfo.city = $scope.eventInfo.address = null;
      $scope.updateLocalStorage('city', null);
      $scope.updateLocalStorage('address', null);
    };

    $scope.eventInfo.invites = [];

    $scope.cancel = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      deleteLocalStorage();
      goToManageDojoEvents($state, null, dojoId);
    };

    $scope.addSession = function () {
      if($scope.eventInfo.sessions.length === 20) return alertService.showError($translate.instant('You can only create a max of 20 sessions/rooms'));
      var session = {
        name: null,
        tickets: [{name: null, type: null, quantity: 0}]
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
        if(ticket.type !== 'other') total += ticket.quantity || 0;
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

    $scope.inviteDojoMembers = function (session) {
      var emptyTicketsFound = _.find(session.tickets, function (ticket) {
        return _.isEmpty(ticket.name) || _.isEmpty(ticket.type);
      });
      if(emptyTicketsFound) return alertService.showAlert($translate.instant('You must complete all of the ticket details before inviting Dojo members.'));
      async.waterfall([
        retrieveDojoUsers,
        showInviteDojoMembersModal
      ], function (err) {
        if(err) return console.error(err);
      });

      function retrieveDojoUsers(done) {
        cdDojoService.loadDojoUsers({dojoId: dojoId}, function (dojoUsers) {
          var eventUserSelection = {};
          eventUserSelection[dojoId] = [];
          _.each(dojoUsers, function (dojoUser) {
            eventUserSelection[dojoId].push({userId: dojoUser.id, title: dojoUser.name});
          });
          return done(null, eventUserSelection);
        }, function (err) {
          if(err) {
            console.error(err);
            return done(err);
          }
        });
      }

      function showInviteDojoMembersModal(eventUserSelection, done) {
        var inviteDojoMembersModalInstance = $modal.open({
          animation: true,
          templateUrl: '/dojos/template/events/session-invite',
          controller: 'session-invite-modal-controller',
          size: 'lg',
          resolve: {
            dojoId: function () {
              return dojoId;
            },
            session: function () {
              return session;
            },
            event: function () {
              return $scope.eventInfo;
            },
            eventUserSelection: function () {
              return eventUserSelection;
            },
            currentUser: function () {
              return currentUser.data;
            }
          }
        });

        inviteDojoMembersModalInstance.result.then(function (result) {
          if(result.ok === false) return alertService.showError($translate.instant(result.why));
          alertService.showAlert($translate.instant('Dojo members successfully added to invite list. They will be notified of the invite when you publish this event.'));
        }, null);
        return done();
      }


    };

    $scope.scrollToInvalid = function (form) {
        if (form.$invalid) {
            angular.element('form[name=' + form.$name + '] .ng-invalid')[0].scrollIntoView();
        } else {
            $scope.eventInfo.publish=true;
        }
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
                } else {
                  deleteLocalStorage();
                }
                if(response.dojoId && response.id) {
                  goToManageDojoEvent($state, usSpinnerService, response.dojoId, response.id);
                } else {
                  goToManageDojoEvents($state, usSpinnerService, dojoId)
                }
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
              } else {
                deleteLocalStorage();
              }
              if(response.dojoId && response.id) {
                goToManageDojoEvent($state, usSpinnerService, response.dojoId, response.id);
              } else {
                goToManageDojoEvents($state, usSpinnerService, dojoId)
              }
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
      var markerPosition;
      if(!$scope.eventInfo.position) {
        markerPosition = new google.maps.LatLng(eventPosition.lat, eventPosition.lng);
      } else {
        markerPosition = new google.maps.LatLng($scope.eventInfo.position.lat, $scope.eventInfo.position.lng);
      }

      $scope.googleMaps = {
        mapOptions: {
          center: markerPosition,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        onTilesLoaded: onTilesLoaded,
        addMarker: addMarker
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

      function addMarker ($event, $params, eventInfo) {
        var map = $scope.googleMaps.map;
        $scope.googleMaps.marker.setMap(null);
        $scope.googleMaps.marker = new google.maps.Marker({
          map: map,
          position: $params[0].latLng
        });
        eventInfo.position = {
          lat: $params[0].latLng.lat(),
          lng: $params[0].latLng.lng()
        };
      }
    }


    function loadDojo(done) {
      cdDojoService.load(dojoId, function(dojo) {

        if(dojo.place && dojo.place.toponymName){
          dojo.place.nameWithHierarchy = dojo.place.toponymName;
          delete dojo.place.toponymName;
        }
        $scope.eventInfo.country = dojo.country;
        $scope.eventInfo.dojoCity = dojo.place;
        $scope.eventInfo.dojoAddress = dojo.address1;

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

        //description editor
        $scope.editorOptions = {
          readOnly: $scope.pastEvent,
          language: 'en',
          uiColor: '#000000',
          height: '200px'
        };

        done(null, event);
      }, done);
    }


    function loadSessions(done) {
      var eventId = $stateParams.eventId;
      cdEventsService.searchSessions({eventId: eventId, status: 'active'}, function (sessions) {
        $scope.eventInfo.sessions = sessions;
        return done();
      }, function (err) {
        console.error(err);
        return done(err);
      });
    }

    function loadLocalStorage(done) {
      if($localStorage[currentUser.data.id] && $localStorage[currentUser.data.id][dojoId] && $localStorage[currentUser.data.id][dojoId].eventForm) {
        if(!_.isEmpty($localStorage[currentUser.data.id][dojoId].eventForm)) {
          alertService.showAlert($translate.instant('There are unsaved changes on this page'));

          var localStorage = $localStorage[currentUser.data.id][dojoId].eventForm;
          if(localStorage.name) $scope.eventInfo.name = localStorage.name;
          if(localStorage.description) $scope.eventInfo.description = localStorage.description;
          if(localStorage.public) $scope.eventInfo.public = localStorage.public;
          if(localStorage.prefillAddress) $scope.eventInfo.prefillAddress = localStorage.prefillAddress;
          if(localStorage.type) $scope.eventInfo.type = localStorage.type;
          if(localStorage.recurringType) $scope.eventInfo.recurringType = localStorage.recurringType;
          if(localStorage.weekdaySelection) $scope.weekdayPicker.selection = localStorage.weekdaySelection;
          if(localStorage.date) $scope.eventInfo.date = new Date(localStorage.date);
          if(localStorage.toDate) $scope.eventInfo.toDate = new Date(localStorage.toDate);
          if(localStorage.city) $scope.eventInfo.city = localStorage.city;
          if(localStorage.address) $scope.eventInfo.address = localStorage.address;
          if(localStorage.sessions) $scope.eventInfo.sessions = localStorage.sessions;
          if(localStorage.position) $scope.eventInfo.position = localStorage.position;
        }

      }

      $scope.$watch('eventInfo.sessions', function (sessions) {
        sessions = _.without(sessions, _.findWhere(sessions, {name: null}))
        if(!_.isEmpty(sessions)) $scope.updateLocalStorage('sessions', sessions);
      }, true);

      $scope.$watch('eventInfo.position', function (mapLatLng) {
        $scope.updateLocalStorage('position', mapLatLng);
      });

      return done();
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
          $scope.hasAccess = false;
          return $state.go('error-404-no-headers');
        } else {
          var eventPosition = results[3].position;
          addMap(eventPosition);
        }
      });
    } else {
      cdEventsService.search({dojoId: dojoId, sort$: {createdAt: -1}, limit$: 1}).then(function (events) {
        var latestEvent = events[0];
        if(latestEvent) $scope.eventInfo.ticketApproval = latestEvent.ticketApproval;
      });
    }

    async.parallel([
      validateEventRequest,
      loadDojo,
      loadCurrentUser,
      loadDojoUsers,
      loadUserTypes,
      loadLocalStorage
    ], function(err, results) {
      if (err) {
        $scope.hasAccess = false;
        return $state.go('error-404-no-headers');
      }
    });
  }

  angular.module('cpZenPlatform')
    .controller('dojo-event-form-controller', [
      '$scope',
      '$stateParams',
      '$state',
      '$sce',
      '$localStorage',
      '$modal',
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
