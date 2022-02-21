;(function() {
  'use strict';

var cdEventbriteIntegration = {
  restrict: 'E',
  templateUrl: '/directives/tpl/eventbrite',
  bindings: {
    dojo: '=?'
  },
  controller: ['$window', 'cdEventbriteService', 'alertService', 'atomicNotifyService',
  '$localStorage', '$stateParams', '$state', '$translate', '$anchorScroll', '$location', '$timeout',
  function ($window, cdEventbriteService, alertService, atomicNotifyService,
  $localStorage, $stateParams, $state, $translate, $anchorScroll, $location, $timeout) {
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
          cdE.organisationsConnected = false;
          delete $localStorage.organisations;
          delete $localStorage.userToken;
          delete $localStorage.token;
          atomicNotifyService.info($translate.instant('Your Eventbrite account has been disconnected'));
          cdE.getConnectButtonText();
        })
        .catch(function () {
          genErrorHandler();
        });
    };

    cdE.eventbriteOrganisations = function (token) {
      cdEventbriteService.getOrganisations(token)
        .then((res) => {

          $localStorage.userToken = res.data.token;
          $localStorage.token = token;
          $localStorage.eventbriteDojo = cdE.dojoId;

          if (res.data.organisations.length > 1) {
            $localStorage.organisations = res.data.organisations;
            $state.go('edit-dojo', {id: cdE.dojoId, '#': 'contact'});
            atomicNotifyService.info($translate.instant('Please select which Eventbrite organisation to connect with'));
          } else {
            cdE.eventbriteAuthorization(res.data.organisations[0].id);
          }
        })
        .catch(() => {
          genErrorHandler();
        });
    };

    cdE.eventbriteAuthorization = function (orgId) {
      cdEventbriteService.authorize(cdE.dojoId, orgId, {code: $localStorage.token, userToken: $localStorage.userToken})
        .then(function (res) {
          $state.go('edit-dojo', {id: cdE.dojoId}, {reload: true});
          atomicNotifyService.success($translate.instant('Your Eventbrite account has been successfully connected'), 5000);
        })
        .catch(function (err) {
          $state.go('my-dojos');
          if (err.status === 403) {
            errMsg = 'You are trying to use an Eventbrite subuser account to connect your Dojo. Unfortunately we only support connecting a Dojo to an Eventbrite account which manages a single Dojo. If you need help please contact info@coderdojo.com.';
          }
          atomicNotifyService.warning($translate.instant(errMsg));
        });
    };

    cdE.anchorScrollToHash = function (locationHash) {
      $timeout(() => {
        const regex = /\#(.*)/;
        const hash = regex.exec(locationHash);

        $location.hash(hash[1]);
        $anchorScroll();
      }, 500);
    };

    cdE.$onInit = function () {
      var token = $stateParams.code;
      cdE.dojoId = $localStorage.eventbriteDojo;
      cdE.organisations = $localStorage.organisations;
      cdE.organisationsConnected = cdE.organisations ? true : false;
      cdE.getConnectButtonText();

      if (window.location.hash) {
        cdE.anchorScrollToHash(window.location.hash)
      }

      if (!_.isUndefined(token)) {
        cdE.saving = true;
        delete $localStorage.eventbriteDojo;
        delete $localStorage.organisations;
        var errMsg = 'There was a problem connecting your account to Eventbrite. Please make sure you are not using private browsing and try again. If this error appears again contact info@coderdojo.com and we will try to help you.';
        if (cdE.dojoId) {
          cdE.eventbriteOrganisations(token);
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
