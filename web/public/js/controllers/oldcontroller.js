// ;(function() {
//   'use strict';
// //  var app = angular.module("myApp", []);
// //app.directive("
// function checkReleaseDate() {
//   return {
//     restrict: 'A',
//     require: 'ngModel',
//     link: function (scope, element, attrs, ngModelCtrl) {
//
//       ngModelCtrl.$parsers.push(checkValidity);
//       ngModelCtrl.$formatters.push(checkValidity);
//
//       console.log(ngModelCtrl.$modelValue);
//       console.log("inside directive");
//       function checkValidity  () {
//         var releaseBeforeEvent;
//         if(checkIfReleaseDateIsBeforeEvent > 0){
//           releaseBeforeEvent = true;
//           console.log('is before');
//         }
//         else{
//           console.log('is after');
//           releaseBeforeEvent = false;
//         }
//
//         ngModelCtrl.$setValidity('checkReleaseDate', releaseBeforeEvent)
//       }
//     }
//   };
//
// }
//
// angular
//     .module('cpZenPlatform')
//     .directive('checkReleaseDate', checkReleaseDate)
// }());
