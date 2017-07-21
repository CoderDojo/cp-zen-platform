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
        atomicNotifyService, $state, $window, $q, $sce, cdDojoService, alertService,
        cdAgreementsService, cdUsersService, intercomService, cdOrganisationsService) {
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
              $translate.instant('Congratulations! Your Dojo application is being reviewed by a member of the CoderDojo Foundation team.') + '\n' +
              $translate.instant('We will will respond to you within 48 hours, so hang tight while we check the information you have submitted.')
            );
            saveOnStateChange();
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
            if (ctrl.application.dojo.id) {
              cdDojoService.getUsersDojos({userId: ctrl.userId})
              .then(function (res) {
                intercomService.update(_.map(res.data, 'id'));
              });
            }
          })
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
              application[key].isValid = !_.isUndefined(step.formValidity) ? step.formValidity : (step.isValid ? step.isValid  : false) ;
              // Flag to display missing field : it's a returning user to this page
              application[key].visited = true;
            }
            delete step.form;
            delete step.formValidity;
            application[key] = _.omitBy(step, function (val) {return _.isNil(val) || val === '';}); // Remove null keys to avoid validations errors
          });
          var lead = {
            userId: ctrl.userId,
            application : application
          };

          if (ctrl.leadId) lead.id = ctrl.leadId;
          return lead;
        };
        ctrl.isValid = ctrl.actions.isValid = function () {
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
          return Math.trunc(header) + '% completed';
        };

        var saveOnStateChange = $rootScope.$on('$stateChangeStart', function (event, nextState, nextParams, fromState) {
          if (nextState.name !== $state.current.name && !nextParams.skip) {
            ctrl.save();
          }
        });

        ctrl.$onInit = function () {
          var leadQuery = {userId: ctrl.currentUser.id, completed: false};
          if ($state.params.id) {
            ctrl.leadId = $state.params.id;
            // By passing an id, we allow ourselves to bypass the restriction regarding the completion
            leadQuery = {id: ctrl.leadId};
          }
          // We use the generic version of search as we don't know yet who's the owner for sure
          // It can be a CDF viewing, which means we don't want to overwrite the owner of the lead
          return cdDojoService.searchDojoLeads(leadQuery)
          .then(function (leads) {
            ctrl.leads = leads.data;
            return $q.resolve();
          })
          .then(function () {
            return cdOrganisationsService.loadUserOrgs(ctrl.currentUser.id)
            .then(function (res) {
              ctrl.orgs = res.data;
              // Multiple lead for a non-authorised user, loophole detected
              if (ctrl.leads.length > 1) {
                ctrl.userId = ctrl.leads[0].userId;
                if (!ctrl.orgs || ctrl.orgs.length === 0 ) {
                  alertService.showError($translate.instant('Multiple ongoing lead, please contact support'));
                  intercomService.show();
                  return $q.reject();
                }
              }
              if (ctrl.leads.length === 1) {
                // Reload previous lead
                if (_.isEmpty(ctrl.orgs) || $state.params.id) {
                  ctrl.application = _.merge(ctrl.application, ctrl.leads[0].application);
                  ctrl.leadId = ctrl.leads[0].id;
                }
                // Set creator user
                ctrl.userId = ctrl.leads[0].userId;
                return $q.resolve();
              }
            });
          })
          .then(function () {
            var userProfileQuery = {
              userId: ctrl.currentUser.id
            };
            if ($state.params.id) {
              userProfileQuery = {
                userId: ctrl.userId
              };
            }
            return cdUsersService.userProfileData(userProfileQuery)
            .then(function (profile) {
              ctrl.profile = profile.data;
            });
          })
          .then(function () {
            // NOTE : this starts to get quite big
            if (ctrl.leads.length === 0 || (!_.isEmpty(ctrl.orgs) && !$state.params.id)) {
              intercomService.InitIntercom();
              ctrl.userId = ctrl.currentUser.id;
              // Merge is used here to avoid overwriting data set by substate ctrllers (ie forms)
              ctrl.application = _.merge(ctrl.application, {
                champion: {
                  firstName: ctrl.profile.firstName,
                  lastName: ctrl.profile.lastName,
                  email: ctrl.profile.email,
                  dob: new Date(ctrl.profile.dob),
                  phone: ctrl.profile.phone,
                  twitter: ctrl.profile.twitter,
                  linkedin: ctrl.profile.linkedin,
                  address: ctrl.profile.address,
                  isValid: false,
                  visited: false
                },
                dojo: {startTime: moment({minutes: 0}), endTime: moment({minutes: 0}), visited: false, isValid: false},
                venue: {private: 0, visited: false, isValid: false},
                team: {visited: false, isValid: false}
              });
            }
          })
          // The user may already have signed the charter, we load this separatly
          .then(function () {
            var agreement = {};
            cdAgreementsService.getCurrentCharterVersion()
            .then(function (response) {
              agreement.version = response.data.version;
            })
            .then(function () {
              return cdAgreementsService.loadUserAgreement(agreement.version, ctrl.profile.id)
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
        ctrl.$onDestroy = function () {
          saveOnStateChange();
        };
      }
    });
}());
