/* global google */
(function() {
  'use strict';

  function getEveryTargetWeekdayInDateRange(dateStart, dateEnd, targetWeekday) {
    var currentDate = dateStart;
    var dates = [];

    while (currentDate <= dateEnd) {
      currentDate = new Date(currentDate);

      if (currentDate.getDay() === targetWeekday) {
        dates.push(currentDate);
      }

      var d = new Date(currentDate.valueOf());
      currentDate = d.setDate(d.getDate() + 1);
    }

    return dates;
  }


  function goToManageDojoEvents($state, dojoId) {
    $state.go('my-dojos.manage-dojo-events', {
      dojoId: dojoId
    });
  }


  function dojoEventFormCtrl(
    $scope,
    $stateParams,
    $state,
    cdEventsService,
    cdDojoService,
    cdCountriesService,
    auth,
    $translate,
    cdLanguagesService
  ) {
    var dojoId = $stateParams.dojoId;
    var now = new Date();

    $scope.eventInfo = {};
    $scope.eventInfo.dojoId = dojoId;
    $scope.eventInfo.public = false;
    $scope.eventInfo.date = now;
    $scope.eventInfo.date.setMinutes(0);
    $scope.eventInfo.date.setSeconds(0);
    $scope.eventInfo.toDate = new Date(
      $scope.eventInfo.date.getTime()
    );

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

    $scope.searchCity = function(str) {
      if (!str.length || str.length < 3) {
        return $scope.cities = [];
      }

      var query = {
        query: {
          filtered: {
            query: {
              multi_match: {
                query: str,
                type: "phrase_prefix",
                fields: ['name', 'asciiname', 'alternatenames', 'admin1Name', 'admin2Name', 'admin3Name', 'admin4Name']
              }
            },
            filter: {
              bool: {
                must: [{
                  term: {
                    countryCode: $scope.eventInfo.country.alpha2
                  }
                }, {
                  term: {
                    featureClass: "P"
                  }
                }]
              }
            }
          }
        },
        from: 0,
        size: 100,
        sort: [{
          asciiname: "asc"
        }]
      };

      cdCountriesService.listPlaces(query, function(result) {
        $scope.cities = _.map(result, function(city) {
          return _.omit(city, 'entity$');
        });
      }, console.error.bind(console));
    };

    $scope.eventInfo.invites = [];

    $scope.loadUsers = function(query) {
      return $scope.dojoUsers;
    };

    $scope.cancel = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      goToManageDojoEvents($state, dojoId);
    };

    $scope.submit = function($event, eventInfo, publish) {
      $event.preventDefault();
      $event.stopPropagation();

      var eventPosition = {
        lat: $scope.googleMaps.marker.getPosition().lat(),
        lng: $scope.googleMaps.marker.getPosition().lng()
      };

      var userTypes = Object.keys(eventInfo.userTypes).filter(function(key) {
        return eventInfo.userTypes[key];
      });

      // Extend eventInfo
      eventInfo.position = eventPosition;
      eventInfo.status = publish ? 'published' : 'saved';
      eventInfo.userTypes = userTypes;

      var isDateRange = !moment(eventInfo.toDate).isSame(eventInfo.date, 'day');

      if (eventInfo.type === 'recurring' && isDateRange) {
        // Extend eventInfo
        eventInfo.dates = getEveryTargetWeekdayInDateRange(
          eventInfo.date,
          eventInfo.toDate,
          $scope.weekdayPicker.selection.id
        );
      }

      cdEventsService.saveEvent(
        eventInfo,
        goToManageDojoEvents.bind(null, $state, dojoId),
        console.error.bind(console)
      );
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

        var position = dojoInfo.coordinates.split(',');

        addMap({
          lat: parseFloat(position[0]),
          lng: parseFloat(position[1])
        });

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
      cdDojoService.getUserTypes(function(userTypes) {
        // Add missing user type
        userTypes.unshift('attendee-u13');

        $scope.eventInfo.userTypes = userTypes.reduce(function(memo, item) {
          memo[item] = false;
          return memo;
        }, {});

        done(null, userTypes);
      }, done);
    }


    function loadEvent(done) {
      var eventId = $stateParams.eventId;

      cdEventsService.getEvent(eventId, function(event) {
        $scope.isEditMode = true;

        event.date = new Date(event.date);
        event.createdAt = new Date(event.createdAt);
        delete event.toDate;

        var userTypes = $scope.eventInfo.userTypes;
        var selectedUserTypes = event.userTypes;
        delete event.userTypes;

        $scope.eventInfo = _.assign($scope.eventInfo, event);
        $scope.eventInfo.userTypes = userTypes;

        selectedUserTypes.forEach(function(selectedUserType) {
          $scope.eventInfo.userTypes[selectedUserType] = true;
        });

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
      'cdCountriesService',
      'auth',
      '$translate',
      'cdLanguagesService',
      dojoEventFormCtrl
    ]);
})();

