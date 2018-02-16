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
      .catch(function () {
        // Something went wrong on our side TODO log with logentries
        genErrorHandler();
      });
    };
    cdE.getConnectButtonText = function () {
      var text = cdE.dojo && cdE.dojo.eventbriteConnected ? 'Reconnect' : 'Connect';
      cdE.eventbriteText = $translate.instant(text);
    };
    cdE.removeAuthorization = function () {
      cdEventbriteService.deauthorize(cdE.dojo.id)
      .then(function () {
        cdE.dojo.eventbriteConnected = false;
        atomicNotifyService.info($translate.instant('Your Eventbrite account has been disconnected'));
        cdE.getConnectButtonText();
      })
      .catch(function () {
        genErrorHandler();
      });
    };
    cdE.$onInit = function () {
      var token = $stateParams.code;
      cdE.dojoId = $localStorage.eventbriteDojo;
      cdE.getConnectButtonText();
      if (!_.isUndefined(token)) {
        cdE.saving = true;
        delete $localStorage.eventbriteDojo;
        if (cdE.dojoId) {
          var errMsg = 'There was a problem connecting your account to Eventbrite. Please make sure you are not using private browsing and try again. If this error appears again contact info@coderdojo.com and we will try to help you.';
          cdEventbriteService.authorize(cdE.dojoId, {code: token})
          .then(function () {
            $state.go('edit-dojo', {id: cdE.dojoId});
            atomicNotifyService.info($translate.instant('Your Eventbrite account has been successfully connected'), 5000);
          })
          .catch(function (err) {
            $state.go('my-dojos');
            if (err.status === 403) {
              errMsg = 'You are trying to use an Eventbrite subuser account to connect your Dojo. Unfortunately we only support connecting a Dojo to an Eventbrite account which manages a single Dojo. If you need help please contact info@coderdojo.com.';
            }
            atomicNotifyService.warning($translate.instant(errMsg));
          });
        } else {
          $state.go('my-dojos');
          atomicNotifyService.warning($translate.instant(errMsg));
        }
      }
    };
  }]
};

angular
    .module('cpZenPlatform')
    .component('cdEventbriteIntegration', cdEventbriteIntegration);

}());
