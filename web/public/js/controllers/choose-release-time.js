angular
  .module('cpZenPlatform')
  .directive("chooseReleaseTime", function () {
    return {
      restrict: "A",
      require: "^form",
      link: function (scope, element, attributes, ngFormCtrl) {
        scope.$watchGroup([ngFormCtrl.$name + '.releaseDate.$modelValue',ngFormCtrl.$name + '.fromDate.$modelValue', ngFormCtrl.$name + '.startTime.$modelValue'], function(oldV, newV) {
          var releaseBeforeEvent;
          var releaseDate = ngFormCtrl.releaseDate.$viewValue;
          var releaseDateInMilli = releaseDate.valueOf();
          var now = new Date();
          var nowMIlli = now.valueOf();
          var startTime = ngFormCtrl.startTime.$modelValue;
          var fromDate = ngFormCtrl.fromDate.$modelValue;
          var eventDateAndTime = new Date(fromDate.getFullYear(),fromDate.getMonth(), fromDate.getDate(), startTime.getHours(), startTime.getMinutes());
          var eventInMilli = eventDateAndTime.valueOf();
          var eventMInusRelease = eventInMilli - releaseDateInMilli;
          var nowMinusRelease = nowMIlli - releaseDateInMilli;
          if (eventMInusRelease > 0 && nowMinusRelease < 0){
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
