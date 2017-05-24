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

        ctrl.save = function () {
          var lead = ctrl.prepareSavePayload();
          return cdDojoService.saveDojoLead(lead)
            .then(function (lead) {
              ctrl.leadId = lead.data.id;
              _.each(ctrl.application, function (step, key) {
                if (step.form) lead.data.application[key].form = step.form;
              });
              ctrl.application = lead.data.application;
            });
        };
        ctrl.actions = {};
        ctrl.actions.submit = function () {
          var deferred = $q.defer();
          var promise = deferred.promise;
          // Submit dojoLead upgrade an existing lead
          // So we presubmit it in case an user went all the way down to the last step in one run
          if (!ctrl.leadId) {
            promise.then(function () {
              ctrl.save();
            });
          }
          promise.then(function () {
            var lead = ctrl.prepareSavePayload();
            cdDojoService.submitDojoLead(ctrl.leadId, lead)
            .then(function () {
              atomicNotifyService.info(
                $translate.instant('Congratulations! Your Dojo application is being reviewed by a member of the CoderDojo Foundation team.') +
                $translate.instant('We will will respond to you within 48 hours, so hang tight while we check the information you have submitted.Congratulations! Your Dojo application is being reviewed by a member of the CoderDojo Foundation team. We will will respond to you within 48 hours, so hang tight while we check the information you have submitted.')
             );
             $state.go('my-dojos');
            })
            .catch(function () {
              // This should not happend and be caught by the front before submitting
            });
          });
          deferred.resolve();
          return promise;
        };
        ctrl.actions.save = function () {
          var index = 0;
          ctrl.save()
          .then(function (lead) {
            if (ctrl.application && ctrl.isValid()) {
              // We go to the review tab
              index = ctrl.tabs.length - 1;
            } else {
              // We go to the next tab that is invalid
              // normal = next; review = next invalid
              index = _.findIndex(ctrl.tabs, {isValid: false});
              if (index < 0) {
                index = ctrl.tabs.length - 1;
              }
            }
            $state.go(ctrl.tabs[index].state);
          });
        };

        ctrl.prepareSavePayload = function () {
          var application = _.cloneDeep(ctrl.application);
          _.each(application, function (step, key, application) {
            application[key].isValid = !_.isUndefined(step.form) ? step.form.$valid : step.isValid;
            delete step.form;
            application[key] = _.omitBy(step, _.isNil);
          });
          var lead = {
            userId: ctrl.currentUser.id,
            completed: ctrl.isValid(),
            application : application
          };

          if (ctrl.leadId) lead.id = ctrl.leadId;
          return lead;
        }
        ctrl.isValid = ctrl.actions.submitReadonly = ctrl.actions.saveVisible = function () {
          var validities = _.map(ctrl.application, function (step) {
            return step.form ? step.form.$valid // Current form validity
              : step.isValid; // saved validity
          });
          return _.every(validities);
        };
        ctrl.actions.isLastTab = function () {
          return _.findIndex(ctrl.tabs[$state.current.name]) -1 === ctrl.tabs.length;
        };
        ctrl.tabHeader = function () {
          var header = 0;
          if (ctrl.application) {
            header = (_.filter(ctrl.application, function (step) {
              return step.isValid; // Only saved validity matter
            })).length / _.keys(ctrl.application).length * 100;
          }
          return header + '% completed';
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
          var leadQuery = {userId: ctrl.currentUser.id, completed: false};
          ctrl.leadId = $state.params.leadId;
          if (ctrl.leadId) leadQuery.id = ctrl.leadId;
          cdUsersService.userProfileData(leadQuery)
          .then(function (profile) {
            profile = profile.data;
            return cdDojoService.searchDojoLeads(leadQuery)
            .then(function (leads) {
              if (leads.data.length > 1) {
                console.log('multiple pending applications, pick one'); // TODO
              }
              if (leads.data.length === 1) {
                ctrl.application = _.merge(ctrl.application, leads.data[0].application);
                ctrl.leadId = leads.data[0].id;
              }
              // NOTE : this starts to get quite big
              if (leads.data.length === 0) {
                // Merge is used here to avoid overwriting data set by substate ctrllers (ie forms)
                ctrl.application = _.merge(ctrl.application, {
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
            var version;
            cdAgreementsService.getCurrentCharterVersion()
            .then(function (response) {
              version = response.data.version;
            })
            .then(function () {
              var agreement = {};
              return cdAgreementsService.loadUserAgreement(version, ctrl.currentUser.id)
              .then(function (response) {
                agreement = response.data;
              })
              .then(function (version) {
                if (agreement) {
                  ctrl.application.charter = {
                    fullName: agreement.fullName,
                    id: agreement.id
                  };
                  ctrl.application.charter.isValid = true;
                } else {
                  ctrl.application.charter = {
                    isValid: false,
                    version: version
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
