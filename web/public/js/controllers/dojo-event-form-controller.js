(function() {
  'use strict';

  function getRoundedNow() {
    var now = new Date();

    var minutes = now.getMinutes();
    var hours = now.getHours();

    var m = (parseInt((minutes + 7.5) / 15) * 15, 10) % 60;
    var h = minutes > 52 ? (hours === 23 ? 0 : ++hours) : hours;

    now.setMinutes(m);
    now.setHours(h);

    return now;
  }


  function dojoEventFormCtrl(
    $scope,
    $stateParams,
    $state,
    cdEventsService,
    cdDojoService,
    cdCountriesService
  ) {
    var dojoId = $stateParams.dojoId;
    var now = new Date();

    $scope.eventInfo = {};
    $scope.eventInfo.date = now;
    $scope.eventInfo.fromDate = now;
    $scope.eventInfo.toDate = now;
    $scope.eventInfo.time = getRoundedNow();

    $scope.minDate = now;
    $scope.hstep = 1;
    $scope.mstep = 15;
    $scope.ismeridian = true;

    $scope.open = function($event, isOpen) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope[isOpen] = true;
    };

    function goToManageDojoEvents(){
      $state.go('manage-dojo-events', {dojoId: dojoId});
    }

    $scope.cancel = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      goToManageDojoEvents();
    };

    $scope.submit = function($event, eventInfo, publish) {
      $event.preventDefault();
      $event.stopPropagation();

      cdEventsService.createEvent({
          name: eventInfo.name,
          date: eventInfo.fromDate,
          location: eventInfo.location,
          description: eventInfo.description,
          capacity: 40,
          public: eventInfo.isPublic,
          category: 'todo',
          user_types: ['todo'],
          dojo_id: dojoId,
          status: publish ? 'published' : 'saved',
          created_at: new Date(),
          created_by: 'user id'
        },
        goToManageDojoEvents,
        console.error.bind(console)
      );
    };


    if ($stateParams.eventId) {
      console.log('TODO: Edit event, load event info if event already exists');
    }


    function getDojoAndPlaces(dojoId, done){
      var dojo = {};

      async.waterfall([
        function(callback) {
          cdDojoService.load(dojoId, callback.bind(null, null), callback);
        },
        function(dojoInfo, response, callback) {
          dojo = dojoInfo;
          var countryCode = dojo.country.alpha2;

          // TODO: send in country code
          var query = {query:{match_all:[]}};

          cdCountriesService.listPlaces(query, callback.bind(null, null), callback);
        }
      ],
      function(err, places) {
        if(err){
          return done(err);
        }

        done(err, {
          dojo: dojo,
          places: places
        });
      });
    }


    var dojo = {};
    var places = [];
    getDojoAndPlaces(dojoId, function(err, result) {
      dojo = result.dojo;
      places = result.places;
    });


    cdDojoService.loadDojoUsers({
      dojoId: dojoId
    }, function(users) {
      // Expose dojo users
      $scope.dojoUsers = users;
    }, console.error.bind(console));


    cdDojoService.getUserTypes(function(userTypes) {
      // Add missing user type
      userTypes.unshift('attendee-u13');

      // Expose user types
      $scope.dojoUserTypes = userTypes;
    }, console.error.bind(console));
  }


  angular.module('cpZenPlatform')
    .controller('dojo-event-form-controller', [
      '$scope',
      '$stateParams',
      '$state',
      'cdEventsService',
      'cdDojoService',
      'cdCountriesService',
      dojoEventFormCtrl
    ]);
})();

