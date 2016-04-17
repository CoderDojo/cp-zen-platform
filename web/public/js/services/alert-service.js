'use strict';
/* global bootbox */

angular.module('cpZenPlatform').factory('alertService',['$rootScope', '$translate', function($rootScope, $translate) {
  var alertService = {};

  alertService.showAlert = function(message, callback) {
    bootbox.alert(message, callback);
  };

  alertService.showError = function(message, callback) {
    bootbox.dialog({
      title: '<span class="glyphicon glyphicon-warning-sign"></span> Error',
      message: '<span class="text-danger">'+message+'</span>',
      className: 'dialog-error',
      buttons: {
        ok: {
          label: 'OK',
          callback: callback
        }
      }
    });
  };

  //  TODO: extend this debugCall to any error handling by providing a contextfor every controller
  alertService.debugError = function(bugName, bugDump, callback) {
    var interComMsg = 'I have a known bug that you try to fix:' + encodeURI(JSON.stringify(bugName))+
             ' This data should help you to figure out what is happening !'+
             encodeURI(JSON.stringify(bugDump));
    bootbox.dialog({
      title: '<span class="glyphicon glyphicon-warning-sign"></span> Hello !',
      message: '<span class="text-danger">'+ $translate.instant('We\'re trying to track down what is causing this bug :') + bugName +'</span>'+
              '<div>'+ $translate.instant('Please use the following link to our support messenger to report more details about it!') + '</div>'+
              '<a href="#" onclick="Intercom(\'showNewMessage\', \''+ interComMsg +'\')">'+ $translate.instant('Click here so we can help you !')+ '</a>',
      className: 'dialog-error',

      buttons: {
        ok: {
          label: 'OK',
          callback: callback
        }
      }
    });
  };

  return alertService;
}]);
