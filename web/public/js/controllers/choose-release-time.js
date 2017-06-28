angular
    .module('cpZenPlatform')
    .directive("chooseReleaseTime", function () {
    return {
        restrict: "A",
        require: "^form",
        link: function (scope, element, attributes, ngFormCtrl) {

           scope.$watchGroup([ngFormCtrl.$name + '.releaseDate.$modelValue',ngFormCtrl.$name + '.fromDate.$modelValue'], function(oldV, newV) {
             var releaseBeforeEvent;
             var releaseDate = ngFormCtrl.releaseDate.$viewValue;
             var releaseDateInMilli = releaseDate.valueOf();
             var eventDate = ngFormCtrl.fromDate.$modelValue;
             var eventInMilli = eventDate.valueOf();
             var eventMInusRelease = eventInMilli - releaseDateInMilli;
             if (eventMInusRelease > 0){
               releaseBeforeEvent = true;
             }
             else{
               releaseBeforeEvent = false;
             }
            ngFormCtrl.releaseDate.$setValidity('chooseReleaseTime', releaseBeforeEvent);
           });
          }
        }
    });
