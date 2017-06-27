// angular
//     .module('cpZenPlatform')
//     .directive("checkReleaseDate", function () {
//     return {
//         restrict: "A",
//         require: "ngModel",
//         link: function (scope, element, attributes, ngModel) {
//
//
//           console.log("inside directive");
//           ngModel.$formatters.push(input);
//
//       //  ngModel.$parsers.push(checkValidity);
//
//          scope.$watch(attributes, function() {
//            console.log(ngModel.NgModelController);
//                   // ngModel.$setViewValue(ngModel.$viewValue);
//                });
//
//
//           function checkValidity  () {
//             console.log("inside checkValidity:");
//             console.log(ngModel.FormController);
//             var isReleaseBeforeEvent;
//
//             if(checkIfReleaseDateIsBeforeEvent > 0){
//               releaseBeforeEvent = true;
//               console.log('is before');
//             }
//             else{
//               console.log('is after');
//               releaseBeforeEvent = false;
//             }
//
//             ngModel.$setValidity('checkReleaseDate', releaseBeforeEvent)
//
//           }
//
//
//         //  ngModel.$parsers.push(checkValidity);
//           //    ngModel.$formatters.push(checkValidity);
//           //
//           // console.log('ok', ngModel);
//           // console.log(scope.date);
//
// //           ngModel.$render = function() {
// //             scope.releaseDate = ngModel.$viewValue.releaseDate;
// //
// // };
//
//       //
//       // console.log(attributes);
//       //     var mywatch = scope.$watch(function(){
//       //        return ngModel;
//       //      }, function(value){
//       //        if(value){
//       //
//       //
//       //          console.log("hi");
//       //          console.log(ngModel.$viewValue);
//       //          console.log(ngModel.$modelValue);
//       //          //console.log(elm.val());
//       //          mywatch();
//       //        }
//       //      });
//
//           // console.log('ngModel',ngModel);
//           // console.log('scope',scope);
//           //
//           // console.log('name',ngModel.$name);
//           // console.log('releaseDate', ngModel.$releaseDate);
//           // console.log('pristine', ngModel.$pristine);
//           // console.log(ngModel.$date);
//           //
//           // console.log('ngMdel .',ngModel.$viewValue);
//           // console.log("directive");
//           // console.log(scope.model);
//           // // console.log(scope.eventInfo.releaseDate);
//           // console.log(scope.eventInfo.releaseDate);
//
//           // scope.$watch(scope.eventInfo.releaseDate, function(){
//           //   console.log("release has changed");
//           //   console.log(scope.eventInfo.releaseDate);
//           // });
//
//               //console.log(ngModel.$modelValue);
//                       }
//     };
// });
