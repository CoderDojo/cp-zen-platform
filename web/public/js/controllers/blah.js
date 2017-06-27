// scope.$watch(attributes.ngModelCtrl, function(newVak) {
//               console.log("Changed to " + ngModelCtrl.$viewValue);
//           });
//
//           scope.$watch(scope, function() {
//                     console.log("inside");
//                     console.log('ok', ngModelCtrl);
//                       console.log(scope);
//                       console.log('eventInfo',scope.eventInfo);
//                       console.log('modelValue', ngModelCtrl.$modelValue);
//                       console.log('attr',attributes);
//                       console.log(attributes.$observe);
//                       console.log('releaseDate',scope.eventForm.releaseDate);
//               ngModel.$setViewValue(ngModel.$viewValue);
//           });
//    console.log(scope.date);
//
//           ngModelCtrl.$render = function() {
//             scope.releaseDate = ngModelCtrl.$viewValue.releaseDate;
//
// };
//
//           var mywatch = scope.$watch(function(){
//              return ngModelCtrl;
//            }, function(value){
//              if(value){
//
//                console.log("hi");
//                console.log(ngModelCtrl.$viewValue);
//                console.log(ngModelCtrl.$validators);
//                console.log(ngModelCtrl.$modelValue);
//                console.log(ngModelCtrl.$viewValue);
//                //console.log(elm.val());
//                mywatch();
//              }
//            });


      //    }

              // console.log(ngModelCtrl.$modelValue);
              // function checkValidity  () {
              //   console.log("inside checkValidity:");
              //   console.log(ngModelCtrl.FormController);
              //   var releaseBeforeEvent;
              //   if(checkIfReleaseDateIsBeforeEvent > 0){
              //     releaseBeforeEvent = true;
              //     console.log('is before');
              //   }
              //   else{
              //     console.log('is after');
              //     releaseBeforeEvent = false;
              //   }
              //
              //  ngModelCtrl.$setValidity('checkReleaseDate', releaseBeforeEvent)
              //
              // }































































// ;(function() {
//   'use strict';
// // var myApp = angular.module("myApp", []);
// //app.directive("
// angular.directive('checkReleaseDate', function() {
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
//
//       }
//     }
//   };
//
// })
//
// angular
//     .module('cpZenPlatform')
//     //.directive('checkReleaseDate', checkReleaseDate)
// }());
