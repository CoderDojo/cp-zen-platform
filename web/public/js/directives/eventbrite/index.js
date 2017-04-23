;(function() {
  'use strict';

var cdEventbriteIntegration = {
  restrict: 'E',
  templateUrl: '/directives/tpl/eventbrite',
  bindings: {
    dojo: '=?'
  },
  controller: ['$window', 'cdEventbriteService', 'alertService', 'atomicNotifyService',
  '$localStorage', '$stateParams', '$state', '$translate',
  function ($window, cdEventbriteService, alertService, atomicNotifyService,
  $localStorage, $stateParams, $state, $translate) {
    var cdE = this;
    cdE.saving = false;
    var genErrorHandler = function () {
      alertService.showError($translate.instant('There was an error on this page. Our technical staff have been notified'),
      function () {
        $state.go('edit-dojo', {id: cdE.dojoId});
      });
    };

    cdE.authorizeOAuthEventBrite = function () {
      cdEventbriteService.getPublicToken()
      .then(function (response) {
        $localStorage.eventbriteDojo = cdE.dojo.id;
        if (response.data.token) {
          $window.location.href = 'https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=' + response.data.token;
        } else {
          // Something went wrong on our side TODO log with logentries
          genErrorHandler();
        }
      })
      .catch(function (err) {
        // Something went wrong on our side TODO log with logentries
        genErrorHandler();
      });
    };
    cdE.$onInit = function () {
      var token = $stateParams.code;
      cdE.dojoId = $localStorage.eventbriteDojo;
      var text = cdE.dojo && cdE.dojo.eventbriteConnected ? 'Reconnect' : 'Connect';
      cdE.eventbriteText = $translate.instant(text);
      if (!_.isUndefined(token)) {
        cdE.saving = true;
        // Commented for testing purpose
        delete $localStorage.eventbriteDojo;
        cdEventbriteService.authorize(cdE.dojoId, {code: token})
        .then(function () {
          $state.go('edit-dojo', {id: cdE.dojoId});
          atomicNotifyService.info($translate.instant('Your eventbrite account has been successfully attached'), 5000);
        });
      }
    };
  }]
};

angular
    .module('cpZenPlatform')
    .component('cdEventbriteIntegration', cdEventbriteIntegration);

}());
