;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdUserStats', {
      bindings: {
        dojoId: '<?',
        usersDojos: '<?'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-user-stats',
      controller: ['cdDojoService', '$q', function(cdDojoService, $q) {
        var ctrl = this;
        ctrl.kidCounter = 0;
        ctrl.mentorCounter = 0;

        function getUsersDojos() {   // it will run the 'getUsersDojos'
          return cdDojoService.getUsersDojos({  
            dojoId: ctrl.dojoId,
            deleted: 0                //  as far as here
          }).then(function (usersDojos) {    // this promise will run
            ctrl.usersDojos = usersDojos.data;  // getting the data from the 'usersDojos' and storing it in ctrl.usersDojos
            return $q.resolve();  // then returning a resolve which allows the next promise to run below
          });
        }

        function generateStats() {   // which for now just logs out the usersDojos.
          _.each(ctrl.usersDojos, function (usersDojo){
            if (_.includes(usersDojo.userTypes, 'mentor')) {
              ctrl.mentorCounter++;
            } else if (_.includes(usersDojo.userTypes, 'attendee-o13') || _.includes(usersDojo.userTypes, 'attendee-u13')) {
              ctrl.kidCounter++;
            }
          });
        }

        var promise = $q.resolve();  //Runs here
        if (!ctrl.usersDojos) {       //if there are no user dojos
          promise = promise.then(getUsersDojos);  // it will redefine the promise so it will link on to the next promise by passing 'getUsersDojos' function ^
        }
        promise.then(generateStats);  // from above, once the resolve runs it calls the 'generateStats' function ^
      }]
    });
}());