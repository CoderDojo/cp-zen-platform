'use strict';
/* global bootbox */

angular.module('cpZenPlatform').factory('alertService', ['$rootScope', '$state', '$window',
function($rootScope, $state, $window) {
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

  alertService.confirm = function(message, callback){
    bootbox.confirm(message, callback);
  }

  return alertService;
}]);
