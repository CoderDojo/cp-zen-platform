angular
    .module('cpZenPlatform')
    .directive("checkReleaseDate", function () {
    return {
        restrict: "A",
        require: "^form",
        link: function (scope, element, attributes, ngFormCtrl) {

           scope.$watch(ngFormCtrl.$name + '.releaseDate.$modelValue', function(oldV, newV) {
             var releaseBeforeEvent;
             var releaseDate = ngFormCtrl.releaseDate.$viewValue;
             var releaseDate1 = new Date(releaseDate);
             var releaseDateInMilli = releaseDate1.valueOf();
             var eventDate = ngFormCtrl.fromDate.$modelValue;
             var eventInMilli = eventDate.valueOf();
             console.log('from',ngFormCtrl.fromDate.$modelValue);
             console.log('eventInMilli', eventInMilli);
             console.log('releaseDateInMilli', releaseDateInMilli);
             var eventMInusRelease = eventInMilli - releaseDateInMilli;
             if (eventMInusRelease > 0){
               releaseBeforeEvent = true;
             }
             else{
               releaseBeforeEvent = false;
             }
            ngFormCtrl.$setValidity('checkReleaseDate', releaseBeforeEvent);
           });
          }
        }
    });
