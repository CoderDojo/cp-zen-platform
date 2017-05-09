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
      controller: function ($rootScope, $translate, usSpinnerService,
        atomicNotifyService, cdDojoService, $state, $window, alertService,
        cdAgreementsService, cdUsersService, $q) {
        var ctrl = this;
        usSpinnerService.spin('start-dojo-spinner');
        ctrl.tabs = [
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
          var promise = $q.defer().promise;
          // Submit dojoLead upgrade an existing lead
          // So we presubmit it in case an user went all the way down to the last step in one run
          if (!ctrl.leadId) {
            promise.then(function () {
              ctrl.save();
            });
          }
          promise.then(function () {
            cdDojoService.submitDojoLead(ctrl.application)
            .then(function () {
              atomicNotifyService.info($translate.instant('Congratz'));
            })
            .catch(function () {
              // This should not happend and be caught by the front before submitting
            });
          });
          promise.resolve();
        };

        ctrl.save = function () {
          var application = _.clone(ctrl.application);
          application = _.each(application, function (step, key) {
            step.isValid = step.form ? step.form.valid$ : step.isValid;
            delete step.form;
            step = _.omitBy(step, _.isNil);
            return {key: step};
          });
          var lead = {
            userId: ctrl.currentUser.id,
            completed: ctrl.isValid(),
            application : application
          };

          if (ctrl.leadId) lead.id = ctrl.leadId;
          return cdDojoService.saveDojoLead(lead)
            .then(function (lead) {
              ctrl.leadId = lead.data.id;
              ctrl.application = lead.data.application;
            });
        };

        ctrl.actions.save = function () {
          var index = 0;
          ctrl.save()
          .then(function (lead) {
            if (ctrl.application && ctrl.isValid()) {
              index = ctrl.tabs.length;
            } else {
              index = _.findIndex(ctrl.tabs, {state: $state.current.name});
              index ++;
            }
            $state.go(ctrl.tabs[index].state);
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
          var header = 0;
          if (ctrl.application) {
            header = (_.filter(ctrl.application, function (step) {
              return (step.form && step.form.$valid) || step.isValid;
            })).length / _.keys(ctrl.application).length * 100;
          }
          return header + '% done';
        };

        ctrl.exitingListener = $window.addEventListener('beforeunload', function ($event) {
          $event.stopPropagation();
          alertService.confirm('Are you sure you want to leave?', function () {
            console.log('duh');
          });
        });

        $rootScope.$on('$stateChangeStart', function (event, nextState, nextParams, fromState) {
          if (nextState.parent !== $state.current.parent) {
            // Are you sure you want to leave?
          }

          if (nextState.name !== $state.current.name) {
            ctrl.save();
          }
        });
        // ctrl.$onDestroy = function ($event) {
        //   console.log($event);
        //   $window.removeEventListener('beforeunload', ctrl.exitingListener);
        //   $event.stopPropagation();
        //   alertService.confirm('Are you sure you want to leave?', function () {
        //     console.log('duh2');
        //   });
        // };

        // TODO: redir to proper substate depending on actual dojolead
        ctrl.$onInit = function () {
          var leadQuery = {userId: ctrl.currentUser.id};
          ctrl.leadId = $state.params.leadId;
          if (ctrl.leadId) leadQuery.id = ctrl.leadId;
          cdUsersService.userProfileData(leadQuery)
          .then(function (profile) {
            profile = profile.data;
            return cdDojoService.searchDojoLeads(leadQuery)
            .then(function (leads) {
              if (leads.data.length > 1) console.log('multiple pending applications, pick one'); // TODO
              if (leads.data.length === 1) {
                _.merge(ctrl.application, leads.data[0].application);
                ctrl.leadId = leads.data[0].id;
              }
              // NOTE : this starts to get quite big
              if (leads.data.length === 0) {
                // Merge is used here to avoid overwriting data set by substate ctrllers (ie forms)
                _.merge(ctrl.application, {
                  champion: {
                    firstName: ctrl.currentUser.firstName,
                    lastName: ctrl.currentUser.lastName,
                    email: ctrl.currentUser.email,
                    dob: new Date(profile.dob),
                    phone: profile.phone,
                    twitter: profile.twitter,
                    linkedin: profile.linkedin,
                    address: profile.address,
                    isValid: false
                }, dojo: {isValid: false}, venue: {isValid: false}, team: {isValid: false}});
              }
            });
          })
          // The user may already have signed the charter, we load this separatly
          .then(function () {
            cdAgreementsService.getCurrentCharterVersion()
            .then(function (response) {
              return response.data.version;
            })
            .then(function (version) {
              return cdAgreementsService.loadUserAgreement(version, ctrl.currentUser.id,
              function (response) {
                if (response) {
                  ctrl.application.charter = {
                    fullName: response.fullName,
                    id: response.id
                  };
                  ctrl.application.charter.isValid = true;
                } else {
                  ctrl.application.charter = {
                    isValid: false,
                    version: cdAgreementsService.getCurrentCharterVersion(),
                    signed_at: new Date()
                  };
                }
              });
            });
          })
          .then(function () {
            usSpinnerService.stop('start-dojo-spinner');
          });
        };
      }
    });
}());
