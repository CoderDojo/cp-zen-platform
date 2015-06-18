(function() {
  'use strict';

  function getEveryTargetWeekdayInDateRange(dateStart, dateEnd, targetWeekday) {
    var currentDate = dateStart;
    var dates = [];

    while (currentDate <= dateEnd) {
      currentDate = new Date(currentDate);

      if(currentDate.getDay() === targetWeekday){
        dates.push(currentDate);
      }

      var d = new Date(currentDate.valueOf());
      currentDate = d.setDate(d.getDate() + 1);
    }

    return dates;
  }


  function dojoEventFormCtrl(
    $scope,
    $stateParams,
    $state,
    cdEventsService,
    cdDojoService,
    cdCountriesService,
    auth
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
      name: 'Sunday'
    }, {
      id: 1,
      name: 'Monday'
    }, {
      id: 2,
      name: 'Tuesday'
    }, {
      id: 3,
      name: 'Wednesday'
    }, {
      id: 4,
      name: 'Thursday'
    }, {
      id: 5,
      name: 'Friday'
    }, {
      id: 6,
      name: 'Saturday'
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


    if ($stateParams.eventId) {
      console.log('TODO: Edit event, load event info if event already exists');
    }


    // Get and expose dojo's country code
    cdDojoService.load(dojoId, function(dojoInfo){
      $scope.eventInfo.country = dojoInfo.country;
    }, console.error.bind(console));


    // Get and expose user id
    auth.get_loggedin_user(function(user) {
      $scope.eventInfo.userId = user.id;
    }, console.error.bind(console));


    // Get and expose dojo users
    cdDojoService.loadDojoUsers({
      dojoId: dojoId
    }, function(users) {
      $scope.dojoUsers = users;
    }, console.error.bind(console));


    // Get and expose user types
    cdDojoService.getUserTypes(function(userTypes) {
      // Add missing user type
      userTypes.unshift('attendee-u13');

      $scope.eventInfo.userTypes = userTypes.reduce(function(memo, item) {
        memo[item] = false;
        return memo;
      }, {});
    }, console.error.bind(console));


    function goToManageDojoEvents(){
      $state.go('my-dojos.manage-dojo-events', {dojoId: dojoId});
    }


    $scope.cancel = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      goToManageDojoEvents();
    };


    $scope.submit = function($event, eventInfo, publish) {
      $event.preventDefault();
      $event.stopPropagation();

      var userTypes = Object.keys(eventInfo.userTypes).filter(function(key){
        return eventInfo.userTypes[key];
      });

      var isDateRange = !moment(eventInfo.toDate).isSame(eventInfo.date, 'day');
      if(isDateRange) {
        var eventDates = getEveryTargetWeekdayInDateRange(eventInfo.date, eventInfo.toDate, $scope.weekdayPicker.selection.id);

        // Todo: Refactor, add createEvents endpoint which takes a list of events
        return async.forEachOf(eventDates, function(value, key, callback) {
          cdEventsService.createEvent({
              name: eventInfo.name,
              date: value,
              country: eventInfo.country,
              city: eventInfo.city,
              address: eventInfo.address,
              description: eventInfo.description,
              capacity: eventInfo.capacity,
              public: eventInfo.public,
              user_types: userTypes,
              dojo_id: eventInfo.dojoId,
              status: publish ? 'published' : 'saved',
              created_at: new Date(),
              created_by: eventInfo.userId
            },
            callback,
            callback
          );
        }, function() {
          goToManageDojoEvents();
        });
      }

      cdEventsService.createEvent({
          name: eventInfo.name,
          date: eventInfo.date,
          country: eventInfo.country,
          city: eventInfo.city,
          address: eventInfo.address,
          description: eventInfo.description,
          capacity: eventInfo.capacity,
          public: eventInfo.public,
          user_types: userTypes,
          dojo_id: eventInfo.dojoId,
          status: publish ? 'published' : 'saved',
          created_at: new Date(),
          created_by: eventInfo.userId
        },
        goToManageDojoEvents,
        console.error.bind(console)
      );
    };
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
      dojoEventFormCtrl
    ]);

})();
