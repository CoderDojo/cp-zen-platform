;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdStartDojo', {
      restrict: 'EA',
      bindings: {
        currentUser: '='
      },
      templateUrl: '/directives/tpl/cd-start-dojo',
      //TODO : dep injection array
      controller: function ($scope, $translate, usSpinnerService,
        atomicNotifyService, cdDojoService, $state, $window, alertService, cdAgreementsService) {
        var ctrl = this;
        usSpinnerService.spin('start-dojo-spinner');
        $scope.tabs = [
          {
            state: 'start-dojo.champion',
            tabTitle: $translate.instant('Champion Registration')
          },
          {
            state: 'start-dojo.information',
            tabTitle: $translate.instant('Dojo Information')
          },
          {
            state: 'start-dojo.venue',
            tabTitle: $translate.instant('Venue Details')
          },
          {
            state: 'start-dojo.team',
            tabTitle: $translate.instant('Gather your Team')
          },
          {
            state: 'start-dojo.charter',
            tabTitle: $translate.instant('Sign the Charter')
          },
          {
            state: 'start-dojo.review',
            tabTitle: $translate.instant('Review your application')
          }
        ];

        ctrl.actions = {};
        ctrl.actions.submit = function () {
          cdDojoService.submitDojoLead(ctrl.application)
          .then(function () {
            atomicNotifyService.info($translate.instant('Congratz'));
          })
          .catch(function () {
            // This should not happend and be caught by the front before submitting
          });
        };

        ctrl.actions.save = function () {
          var index = 0;
          var lead = {
            userId: ctrl.currentUser.id,
            completed: ctrl.isValid(),
            application : _.each(_.clone(ctrl.application), function (step, key) {
              delete step.form;
              step.isValid = step.form ? step.form.valid$ : step.isValid;
              return {key: step};
            })
          };
          if (ctrl.leadId) lead.id = ctrl.leadId;
          cdDojoService.saveDojoLead(lead)
          .then(function (lead) {
            ctrl.leadId = lead.data.id;
            ctrl.application = lead.data.application;
            if (ctrl.application && ctrl.isValid()) {
              index = $scope.tabs.length;
            } else {
              index = _.findIndex($scope.tabs, {state: $state.current.name});
              index ++;
            }
            $state.go($scope.tabs[index].state);
          });
        };

        ctrl.isValid = ctrl.actions.submitReadonly = ctrl.actions.saveVisible = function () {
          var validities = _.map(ctrl.application, function (step) {
            return step.form ? step.form.$valid // Current form validity
              : step.isValid; // saved validity
          });
          return _.every(validities);
        };

        ctrl.tabHeader = function () {
          return (_.filter(ctrl.application, function (application) { return application.form.$valid; }).length / ctrl.application.length) * 100;
        };

        ctrl.exitingListener = $window.addEventListener('beforeunload', function ($event) {
          $event.stopPropagation();
          alertService.confirm('Are you sure you want to leave?', function () {
            console.log('duh');
          });
        });

        // $scope.on('stateChangeStart', function (nextState, nextParams) {
        //   if (nextState.parent !== $state.current.name)
        // })
        // ctrl.$onDestroy = function ($event) {
        //   console.log($event);
        //   $window.removeEventListener('beforeunload', ctrl.exitingListener);
        //   $event.stopPropagation();
        //   alertService.confirm('Are you sure you want to leave?', function () {
        //     console.log('duh2');
        //   });
        // };

        // TODO: redir to proper substate depending on actual dojolead
        this.$onInit = function () {
          var leadQuery = {userId: ctrl.currentUser.id};
          ctrl.leadId = $state.params.leadId;
          if (ctrl.leadId) leadQuery.id = ctrl.leadId;
          cdDojoService.searchDojoLeads(leadQuery)
          .then(function (leads) {
            if (leads.data.length > 1) console.log('multiple pending applications, pick one'); // TODO
            if (leads.data.length === 1) ctrl.application = leads.data[0].application;
            if (leads.data.length === 0) ctrl.application = {
              champion: {
                firstName: ctrl.currentUser.firstName,
                lastName: ctrl.currentUser.lastName,
                email: ctrl.currentUser.email,
                isValid: false
            }, dojo: {isValid: false}, venue: {isValid: false}, team: {isValid: false}};
          })
          // The user may already have signed the charter, we load this separatly
          .then(function () {
            return cdAgreementsService.loadUserAgreement(ctrl.currentUser.id, function (response) {
              ctrl.application.charter = response || {isValid: false};
            });
          })
          .then(function () {
            usSpinnerService.stop('start-dojo-spinner');
          });
        };
      }
    });
}());
