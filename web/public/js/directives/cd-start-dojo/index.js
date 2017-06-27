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
        cdAgreementsService, cdUsersService, $q, $sce) {
        var ctrl = this;
        usSpinnerService.spin('start-dojo-spinner');
        ctrl.tabs = [
          {
            name: 'champion',
            state: 'start-dojo.champion',
            status: setStatusIcon,
            validity: '',
            tabTitle: $translate.instant('Champion Registration')
          },
          {
            name: 'dojo',
            state: 'start-dojo.information',
            status: setStatusIcon,
            validity: '',
            tabTitle: $translate.instant('Dojo Information')
          },
          {
            name: 'venue',
            state: 'start-dojo.venue',
            status: setStatusIcon,
            validity: '',
            tabTitle: $translate.instant('Venue Details')
          },
          {
            name: 'team',
            state: 'start-dojo.team',
            status: setStatusIcon,
            validity: '',
            tabTitle: $translate.instant('Gather your Team')
          },
          {
            name: 'charter',
            state: 'start-dojo.charter',
            status: setStatusIcon,
            validity: '',
            tabTitle: $translate.instant('Sign the Charter')
          },
          {
            name: 'review',
            state: 'start-dojo.review',
            tabTitle: $translate.instant('Review your application')
          }
        ];
        function setStatusIcon () {
          return $sce.trustAsHtml(this.validity);
        }

        ctrl.save = function () {
          var lead = ctrl.prepareSavePayload();
          lead.completed = false;
          return cdDojoService.saveDojoLead(lead)
            .then(function (lead) {
              ctrl.leadId = lead.data.id;
              ctrl.application = lead.data.application;
            });
        };
        ctrl.actions = {};
        ctrl.actions.submit = function () {
          // Submit dojoLead upgrade an existing lead
          // So we presubmit it in case an user went all the way down to the last step in one run
          var lead = ctrl.prepareSavePayload();
          lead.completed = ctrl.isValid();
          return cdDojoService.submitDojoLead(ctrl.leadId, lead)
          .then(function () {
            atomicNotifyService.info(
              $translate.instant('Congratulations! Your Dojo application is being reviewed by a member of the CoderDojo Foundation team.') + '<br/>' +
              $translate.instant('We will will respond to you within 48 hours, so hang tight while we check the information you have submitted.')
            );
            $state.go('my-dojos');
          })
          .catch(function () {
            // This should not happen and be caught by the front before submitting
          });
        };
        ctrl.actions.save = function () {
          ctrl.save()
          .then(function (lead) { ctrl.setCharterStatus(ctrl.application.charter); })
          .then(function (lead) {
            ctrl.goToNextStep(true);
          });
        };

        // Redirect you to the next more logic step.
        // Should not block you while filling (next is the order based next)
        // but should help you when reviewing (next is the next Invalid or the review page is fully valid)
        ctrl.goToNextStep = function (excludePrevious) {
          var index = 0;
          if (ctrl.application && ctrl.isValid()) {
            // We go to the review tab
            index = ctrl.tabs.length - 1;
          } else {
            // We go to the next tab that is invalid
            // normal = next; review = next invalid
            var state = $state.current.name;
            var application = ctrl.application;
            var tabs = _.cloneDeep(ctrl.tabs);
            if (excludePrevious) {
              var currentStepIndex = _.findIndex(ctrl.tabs, {state: state});
              // We increase of 1 to exclude self
              if (currentStepIndex < ctrl.tabs.length) currentStepIndex ++;
              tabs = tabs.splice(currentStepIndex, ctrl.tabs.length);
              application = _.pick(ctrl.application, _.map(tabs, 'name'));
            }
            var nextStep = _.findKey(application, {isValid: false});
            index = _.findIndex(ctrl.tabs,
              function (o, k) {
                return o.name === nextStep;
              });
            if (index < 0) {
              index = ctrl.tabs.length - 1;
            }
          }
          var nextState = ctrl.tabs[index].state;
          var deferred = $q.defer();
          if (nextState !== $state.current.name) {
            // We force a reinit of the next state, elsewhat controllers'form may not initialize
            $state.go(nextState, {skip: true});
          }
        };

        ctrl.prepareSavePayload = function () {
          var application = _.cloneDeep(ctrl.application);
          var currentStep = _.find(ctrl.tabs, {state: $state.current.name});
          _.each(application, function (step, key, application) {
            if (currentStep.name === key) { // We modify only the current step
              application[key].isValid = step.isValid ? step.isValid : (!_.isUndefined(step.formValidity) ? step.formValidity : false) ;
              // Flag to display missing field : it's a returning user to this page
              application[key].visited = true;
            }
            delete step.form;
            delete step.formValidity;
            application[key] = _.omitBy(step, _.isNil); // Remove null keys to avoid validations errors
          });
          var lead = {
            userId: ctrl.currentUser.id,
            application : application
          };

          if (ctrl.leadId) lead.id = ctrl.leadId;
          return lead;
        };
        ctrl.isValid = ctrl.actions.submitReadonly = ctrl.actions.saveVisible = function () {
          var validities = _.map(ctrl.application, function (step) {
            return step.formValidity ||// Current form validity
              step.isValid; // saved validity
          });
          ctrl.updateTabsStatus();
          return _.every(validities);
        };

        ctrl.updateTabsStatus = function () {
          _.each(ctrl.application, function (step, key) {
            var index = _.findKey(ctrl.tabs, {name: key});
            ctrl.tabs[index].validity = '<i class="fa ' + (step.isValid ? 'fa-check cd-icon--success' : step.visited ? 'fa-times cd-icon--danger' : '') + '"></i>';
          });
        };
        ctrl.actions.isLastTab = function () {
          return _.findIndex(ctrl.tabs, _.find(ctrl.tabs, {state: $state.current.name})) === ctrl.tabs.length - 1;
        };
        ctrl.setCharterStatus = function (agreement) {
          if (agreement && agreement.id) {
            ctrl.application.charter = {
              fullName: agreement.fullName,
              id: agreement.id
            };
            ctrl.application.charter.isValid = true;
            ctrl.application.charter.visited = true;
          } else {
            ctrl.application.charter = {
              isValid: false,
              visited : agreement.visited || false
            };
          }
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

        // ctrl.uponLeaving = function (event) {
        //   if (confirm('Are you sure you want to leave?')) {
        //       // Save it!
        //       event.preventDefault();
        //       event.stopImmediatePropagation();
        //   } else {
        //       // Do nothing!
        //   }
        // };

        // ctrl.exitingListener = $window.addEventListener('beforeunload', function ($event) {
        //   $window.removeEventListener('beforeunload', ctrl.exitingListener);
        //   // ctrl.uponLeaving($event);
        // });

        $rootScope.$on('$stateChangeStart', function (event, nextState, nextParams, fromState) {
          // if (nextState.parent !== $state.current.parent) {
          //   // ctrl.uponLeaving(event);
          // }

          if (nextState.name !== $state.current.name && !nextParams.skip) {
            ctrl.save();
          }
        });

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
                // TODO : Do a request to orgs to see if it's a valid scenario
                console.log('multiple pending applications, pick one');
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
                    isValid: false,
                    visited: false
                  },
                  dojo: {hour: moment({minutes: 0}), visited: false, isValid: false},
                  venue: {visited: false, isValid: false},
                  team: {visited: false, isValid: false}
                });
              }
            });
          })
          // The user may already have signed the charter, we load this separatly
          .then(function () {
            var agreement = {};
            cdAgreementsService.getCurrentCharterVersion()
            .then(function (response) {
              agreement.version = response.data.version;
            })
            .then(function () {
              return cdAgreementsService.loadUserAgreement(agreement.version, ctrl.currentUser.id)
              .then(function (response) {
                if (response.data) {
                  agreement = response.data;
                  agreement.visited = true;
                } else {
                  agreement = ctrl.application.charter || {};
                }
              })
              .finally(function () { ctrl.setCharterStatus(agreement); });
            });
          })
          .then(function () {
            usSpinnerService.stop('start-dojo-spinner');
            // We go to the next invalid step when the application has been previously started
            if (ctrl.leadId) ctrl.goToNextStep();
          });
        };
      }
    });
}());
