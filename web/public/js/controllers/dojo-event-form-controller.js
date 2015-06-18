(function() {
  'use strict';

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

      cdEventsService.createEvent({
          name: eventInfo.name,
          date: eventInfo.date,
          country: eventInfo.country,
          city: {},
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


    getDojoAndPlaces(dojoId, function(err, result) {
      var dojo = result.dojo;
      var places = result.places;
      $scope.eventInfo.country = dojo.country;
    });


    auth.get_loggedin_user(function(user) {
      $scope.eventInfo.userId = user.id;
    }, console.error.bind(console));


    cdDojoService.loadDojoUsers({
      dojoId: dojoId
    }, function(users) {
      // Expose dojo users
      $scope.dojoUsers = users;
    }, console.error.bind(console));


    cdDojoService.getUserTypes(function(userTypes) {
      // Add missing user type
      userTypes.unshift('attendee-u13');

      $scope.eventInfo.userTypes = userTypes.reduce(function(memo, item) {
        memo[item] = false;
        return memo;
      }, {});

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
      'auth',
      dojoEventFormCtrl
    ]);
})();

