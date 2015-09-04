/* global google */
(function() {
  'use strict';

  function getEveryTargetWeekdayInDateRange(dateStart, dateEnd, targetWeekday, eventType, utcOffset) {
    var currentDate = dateStart;
    var dates = [];
    var biWeeklyEventSwitch = false;

    while (currentDate <= dateEnd) {
      currentDate = moment.utc(new Date(currentDate)).toDate();

      if (currentDate.getDay() === targetWeekday) {
        if(eventType === 'weekly') {
          var dateToAdd = moment.utc(currentDate).add(utcOffset, 'minutes').toISOString();
          dates.push(dateToAdd);
        } else {
          if(!biWeeklyEventSwitch) {
            dates.push(currentDate.toISOString());
            biWeeklyEventSwitch = true;
          } else {
            biWeeklyEventSwitch = false;
          }
        }
      }

      currentDate= moment.utc(currentDate).add(1, 'days');
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

  function dojoEventFormCtrl($scope, $stateParams, $state, cdEventsService, cdDojoService, cdUsersService, auth, $translate, cdLanguagesService, usSpinnerService, alertService, utilsService) {
    var dojoId = $stateParams.dojoId;
    var now = new Date();
    var utcOffset = moment().utcOffset();
    var defaultEventTime = moment.utc(now).add(2, 'hours').toDate();
    $scope.today = new Date();

    $scope.eventInfo = {};
    $scope.eventInfo.dojoId = dojoId;
    $scope.eventInfo.public = false;
    $scope.eventInfo.date = defaultEventTime;
    $scope.eventInfo.date.setMinutes(0);
    $scope.eventInfo.date.setSeconds(0);
    $scope.eventInfo.toDate = new Date(
      $scope.eventInfo.date.getTime()
    );
    $scope.eventInfo.recurringType = 'weekly';

    $scope.datepicker = {};
    $scope.datepicker.minDate = now;

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

    $scope.loadUsers = function(query) {
      return $scope.dojoUsers;
    };

    $scope.cancel = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      goToManageDojoEvents($state, null, dojoId);
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

      eventInfo.status = $scope.publish ? 'published' : 'saved';
      eventInfo.userType = eventInfo.userType && eventInfo.userType.name ? eventInfo.userType.name : '';

      if(!_.isEmpty(eventInfo.invites)) {
        eventInfo.emailSubject = $translate.instant('Event Invitation');
      }

      var isDateRange = !moment.utc(eventInfo.toDate).isSame(eventInfo.date, 'day');

      if (eventInfo.type === 'recurring' && isDateRange) {
        // Extend eventInfo
        if(eventInfo.recurringType === 'weekly') {
          eventInfo.dates = getEveryTargetWeekdayInDateRange(
            eventInfo.date,
            eventInfo.toDate,
            $scope.weekdayPicker.selection.id,
            'weekly',
            utcOffset
          );
        } else {
          eventInfo.dates = getEveryTargetWeekdayInDateRange(
            eventInfo.date,
            eventInfo.toDate,
            $scope.weekdayPicker.selection.id,
            'biweekly',
            utcOffset
          );
        }
      } else {
        var eventDate = moment.utc(eventInfo.date).add(utcOffset, 'minutes').toISOString();
        eventInfo.dates = [eventDate];
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
      cdDojoService.load(dojoId, function(dojoInfo) {
        $scope.eventInfo.country = dojoInfo.country;
        $scope.eventInfo.city = dojoInfo.place;
        $scope.eventInfo.address = dojoInfo.address1;

        var position = [];
        if(dojoInfo.coordinates) {
          position = dojoInfo.coordinates.split(',');
        }

        $scope.dojoInfo = dojoInfo;

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
            var country = countries[dojoInfo.alpha2];
            addMap({
              lat: country[0],
              lng: country[1]
            })
          }, done)
        }

        done(null, dojoInfo);

      }, done);
    }

    function loadCurrentUser(done) {
      auth.get_loggedin_user(function(user) {
        $scope.eventInfo.userId = user.id;
        done(null, user);
      }, done);
    }

    function loadDojoUsers(done) {
      cdDojoService.loadDojoUsers({
        dojoId: dojoId
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

        event.date = moment.utc(_.first(event.dates)).subtract(utcOffset, 'minutes').toDate();
        event.createdAt = new Date(event.createdAt);
        event.toDate = new Date(_.last(event.dates));

        var eventDay =  moment.utc(_.first(event.dates), 'YYYY-MM-DD HH:mm:ss').format('dddd');
        var dayObject = _.find($scope.weekdayPicker.weekdays, function (dayObject) {
          return dayObject.name === $translate.instant(eventDay);
        });

        $scope.weekdayPicker.selection = dayObject;
        $scope.eventInfo = _.assign($scope.eventInfo, event);
        $scope.eventInfo.userType = _.where($scope.eventInfo.userTypes, {name: $scope.eventInfo.userType})[0];
        done(null, event);
      }, done);
    }

    if ($stateParams.eventId) {

      return async.series([
        loadDojoUsers,
        loadUserTypes,
        loadEvent
      ], function(err, results) {
        if (err) {
          console.error(err);
        }

        var eventPosition = results[2].position;

        addMap(eventPosition);
      });
    }

    async.parallel([
      loadDojo,
      loadCurrentUser,
      loadDojoUsers,
      loadUserTypes
    ], function(err, results) {
      if (err) {
        console.error(err);
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
      dojoEventFormCtrl
    ]);
})();
