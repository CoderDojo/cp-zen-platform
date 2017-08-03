;(function() {
'use strict';
/*global $*/
var ctrller = function ($state, alertService, auth, tableUtils, cdDojoService,
   $location, cdUsersService, $translate, utilsService, cdOrganisationsService, $q, cdAgreementsService) {
  var ctrl = this;
  var errorMsg = $translate.instant('error.general');
  ctrl.dojoStagesSettings = {
    selectByGroups: [true, false],
    groupByTextProvider: function (groupValue) {
      return groupValue ? 'Active' : 'Inactive';
    }
  };
  ctrl.setStageFilterValue = function () {
    var stages = _.map(ctrl.selectedStages, 'id');
    ctrl.filter.stages = stages.length > 0 ? {in$: stages} : undefined;
    ctrl.filterDojos();
  };
  ctrl.dojoStagesEvents = {
    onItemDeselect: ctrl.setStageFilterValue,
    onItemSelect: ctrl.setStageFilterValue
  };
  ctrl.$onInit = function () {
    ctrl.filter = {};
    ctrl.filter.verified = 1;
    ctrl.filter.deleted = 0;
    ctrl.selectedStages = [];
    ctrl.itemsPerPage = 10;
    ctrl.getSortClass = utilsService.getSortClass;
    ctrl.changedDojos = [];
    ctrl.changedLeads = [];
    ctrl.dojoDeletedStatuses = [{
      value: 1,
      label: 'deleted'
    }, {
      value: 0,
      label: 'not deleted'
    }];
    cdDojoService.getDojoConfig(function (json) {
      ctrl.dojoStages = _.map(json.dojoStages, function (item) {
        // Duplicate value/id so that we can support legacy code while using multiselect
        return { id: item.value, value: item.value, label: $translate.instant(item.label), active: (item.value !== 4) };
      });
      ctrl.selectedStages = _.filter(ctrl.dojoStages, function (stage) {
        return stage.id !== 4;
      });
      ctrl.dojoStates = _.map(json.verificationStates, function (item) {
        return {value: item.value, label: $translate.instant(item.label)};
      });
    });
    auth.get_loggedin_user(function (user) {
      if (!_.includes(user.roles, 'cdf-admin')){
        $state.go('error-404-no-headers')
      }
      ctrl.loadPage(ctrl.filter, true);
    });
    cdDojoService.listCountries(function (countries) {
      ctrl.countries = countries;
    });
  };

  ctrl.pageChanged = function () {
    ctrl.loadPage(ctrl.filter, false);
  };
  ctrl.buildQuery = function (target) {
    var payload = {
      name: ctrl.filter.name,
      verified: ctrl.filter.verified,
      email: ctrl.filter.email,
      creatorEmail: ctrl.filter.creatorEmail,
      deleted: ctrl.filter.deleted,
      stage: ctrl.filter.stages,
      alpha2: ctrl.filter.country && ctrl.filter.country.alpha2,
      limit$: ctrl.itemsPerPage,
      skip$: ctrl.skip,
      sort$: ctrl.sort
    };
    var baseFields = {
      dojo: _.keys(payload),
      lead: ['email', 'deleted', 'skip$', 'limit$']
    };
    var selectedFields = baseFields[target];
    var query = _.omitBy(payload, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });
    return _.pick(query, selectedFields);
  };

  ctrl.getDojoStageLabel = function(stage) {
    if (stage)
      return (_.find(ctrl.dojoStages, function(item) { return item.value === parseInt(stage) })).label;
    return '';
  };

  ctrl.setStyle = function (dojo) {
    var signed = !allSigned(dojo);
    var deleted = isDeleted(dojo);
    return signed || deleted ? {'background-color': 'rgba(255, 0, 0, 0.05)'} : {'background-color': 'white'};
  };

  function isDeleted (dojo) {
    return dojo.deleted === 1;
  }

  function allSigned (dojo) {
    var currentAgreementVersion = 2;
    var signed = _.find(ctrl.agreements, function (agreement) {
      return agreement.userId === dojo.creator;
    });
    return _.identity(signed);
  }

  ctrl.allSigned = allSigned;

  ctrl.editDojo = function (dojo) {
    cdDojoService.setDojo(dojo, function (response) {
      $location.path('/dashboard/edit-dojo/'+ dojo.id);
    }, function (err) {
      if (err) {
        alertService.showError(errorMsg);
      }
    });
  };

  ctrl.resetFilter = function () {
    ctrl.filter = {};
    ctrl.filter.verified = 1;

    ctrl.loadPage(ctrl.filter, true);
  };
  ctrl.loadPage = function (filter, resetFlag) {
    //sort ascending = 1
    //sort descending = -1
    ctrl.sort = ctrl.sort ? ctrl.sort : { created: -1 };
    ctrl.dojos = [];
    function getDojos () {
      var loadPageData = tableUtils.loadPage(resetFlag, ctrl.itemsPerPage, ctrl.pageNo, query);
      ctrl.pageNo = loadPageData.pageNo;
      ctrl.skip = loadPageData.skip;
      var query = ctrl.buildQuery('dojo');
      return cdDojoService.search(query).then(function (result) {
        if(!_.isUndefined(result.ok) && result.ok === false){
          $state.go('error-404-no-headers');
          return $q.reject();
        }
        ctrl.dojos = ctrl.formatDojos(result);
        if (ctrl.dojos.length > 0) {
          return cdDojoService.list(_.omit(query, ['limit$', 'skip$', 'sort$']), function (result) {
            ctrl._dojoLength = result.length;
          });
        } else {
          ctrl._dojoLength = 0;
          return $q.resolve();
        }
      }, function (err) {
        alertService.showError($translate.instant('An error has occurred while loading Dojos'));
        return $q.reject(err);
      });
    }
    function getUncompletedLeads () {
      // We only display uncompleted leads when the unverified filter is set manually
      if (ctrl.filter.verified === 0 &&
         (!ctrl.filter.name && !ctrl.filter.email && !ctrl.filter.creatorEmail && !ctrl.filter.country)) {
        var query = _.extend(ctrl.buildQuery('lead'), {completed: false, sort$: { updatedAt: -1 }});
        return cdDojoService.searchDojoLeads(query)
        .then(function (res) {
          var filteredLeads = res.data;
          return $q.resolve(filteredLeads);
        })
        .then(function (filteredLeads) {
          // Set pagination
          if (filteredLeads) {
            return cdDojoService.searchDojoLeads(_.omit(query, ['limit$', 'skip$', 'sort$']))
            .then(function (res) {
              var leads = res.data;
              ctrl._leadLength = leads.length;
              // Filter uncompleted leads
              var leadsIds = _.map(leads, 'id');
              ctrl.dojos = _.omitBy(ctrl.dojos, function (dojo) {
                return leadsIds.indexOf(dojo.dojoLeadId) > -1;
              });
              ctrl.leads = ctrl.formatDojos(_.map(filteredLeads, function (lead) {
                return _.extend(lead.application.dojo, lead.application.venue, {
                  dojoLeadId: lead.id,
                  creator: lead.userId,
                  creators: [{email: lead.email, id: lead.userId}],
                  deleted: lead.deleted,
                  completed: lead.completed,
                  completedAt: lead.completedAt
                });
              }));
              return $q.resolve();
            });
          } else {
            ctrl._leadLength = 0;
            return $q.resolve();
          }
        });
      } else {
        return $q.resolve();
      }
    }
    function getRelatedLeads () {
      // We only need to extend definition when we don't have enough info
      // which is to say, when it's an uncomplete lead
      if (ctrl.filter.verified !== 1 && ctrl.dojos.length > 0) {
        return cdDojoService.searchDojoLeads({completed: true, id: {in$: _.map(ctrl.dojos, 'dojoLeadId')}})
        .then(function (res) {
          var leads = res.data;
          _.each(ctrl.dojos, function (dojo, index) {
            var lead = _.find(leads, function (lead) { return lead.id === dojo.dojoLeadId });
            if (lead) {
              ctrl.dojos[index] = _.merge({}, lead, dojo); // order matter, we want in priority the dojo fields
            }
          });
          return $q.resolve();
        });
      } else {
        return $q.resolve();
      }
    }
    function getUserOrg () {
      var userIds = _.compact(_.map(ctrl.dojos, 'creator').concat(_.map(ctrl.leads), 'userId'));
      return cdOrganisationsService.loadUsersOrg({userIds: userIds})
      .then(function (userOrgs) {
        ctrl.userOrg = {};
        _.each(userOrgs.data, function (userOrg) {
          ctrl.userOrgs[userOrg.userId] = userOrg;
        });
        return $q.resolve();
      });
    }
    function getOrgs () {
      return cdOrganisationsService.list({query: {orgIds: _.map(ctrl.userOrgs, 'orgId')}})
      .then(function (orgs) {
        ctrl.orgs = {};
        _.each(orgs.data, function (org) {
          ctrl.orgs[org.id] = org;
        });
        return $q.resolve();
      });
    }
    function getCharters () {
      // NOTE: This may be wrong : should we get the owner instead ?
      var userIds = _.compact(_.map(ctrl.dojos, 'creator').concat(_.map(ctrl.leads, 'application.champion.userId')));
      if (userIds.length > 0) {
        return cdAgreementsService.search({userId: {in$: userIds}, agreementVersion: 2})
        .then(function (res) {
          ctrl.agreements = res.data;
          return $q.resolve();
        });
      } else {
        return $q.resolve();
      }
    }
    getDojos()
    .then(function () {
      return $q.all([
        getUncompletedLeads(),
        getRelatedLeads(),
        getUserOrg(),
        getOrgs(),
        getCharters()]);
    })
    .then(function () {
      // Set pagination
      ctrl.totalItems = _.max([ctrl._dojoLength, ctrl._leadLength]);
    });
  };

  ctrl.formatDojos = function (map) {
    return _.map(map, function (dojo) {
      if (!_.isUndefined(dojo)) {
        dojo.origVerified = dojo.verified;
        dojo.country = dojo.alpha2 ? dojo.alpha2.toLowerCase() : '';
        // No, it's not chainable.
        if (dojo.urlSlug) {
          var path = dojo.urlSlug.split('/');
          path.splice(0, 1);
          path = path.join('/');
          dojo.path = path;
        }
      } else {
        return {};
      }
      return dojo;
    });
  };

  ctrl.filterDojos = function () {
    ctrl.loadPage(ctrl.filter, true);
    ctrl.changedDojos = [];
    ctrl.changedLeads = [];
  };
  ctrl.applyMarkedDojos = function (event) {
    ctrl.changedDojos = _.map(ctrl.changedDojos, function (dojo) {
      if (dojo.creatorEmail) {
        delete dojo.creatorEmail;
      }

      if (dojo.agreements) {
        delete dojo.agreements;
      }

      return dojo;
    });

    ctrl.dojosToBeDeleted = _.filter(ctrl.changedDojos, function (changedDojo) {
      return changedDojo.toBeDeleted;
    });

    ctrl.dojosToBeUpdated = _.filter(ctrl.changedDojos, function (changedDojo) {
      return !changedDojo.toBeDeleted;
    });

    ctrl.leadsToBeDeleted = _.filter(ctrl.changedLeads, {toBeDeleted: true});

    function updateDojos(cb) {
      if (_.isEmpty(ctrl.dojosToBeUpdated)) {
        return cb();
      }
      var dojosToBeVerified = _.map(ctrl.dojosToBeUpdated, function (dojo) {
        return {
          id: dojo.id,
          verified: dojo.verified
        };
      });
      cdDojoService.bulkVerify(dojosToBeVerified)
      .then(function (response) {
        alertService.showAlert($translate.instant('Dojos have been successfully (un)verified'));
        cb();
      })
      .catch(function (err) {
        cb(err);
      });
    }

    function deleteDojos (cb) {
      if (_.isEmpty(ctrl.dojosToBeDeleted)) {
        return cb();
      }
      var dojos = _.map(ctrl.dojosToBeDeleted, function (dojo) {
        return {
          id: dojo.id,
          creator: dojo.creator,
          dojoLeadId: dojo.dojoLeadId
        };
      });
      cdDojoService.bulkDelete(dojos).then(function (response) {
        alertService.showAlert($translate.instant('Dojo has been successfully deleted'));

        return cb();
      }, function (err) {
        alertService.showError(errorMsg);

        cb(err);
      });
    }

    function deleteLeads (cb) {
      if (_.isEmpty(ctrl.leadsToBeDeleted)) {
        return cb();
      }
      async.each(ctrl.leadsToBeDeleted, function (lead, eCb) {
        cdDojoService.deleteDojoLeads(lead.dojoLeadId)
        .then(function () {
          eCb();
        })
        .catch(function (err) {
          eCb(err);
        });
      }, function (err, res) {
        if (err) {
          alertService.showError(errorMsg);
        } else {
          alertService.showAlert($translate.instant('Lead has been successfully deleted'));
          cb();
        }
      });
    }

    if (ctrl.dojosToBeUpdated.length > 0 || ctrl.dojosToBeDeleted.length > 0 || ctrl.leadsToBeDeleted.length > 0) {
      async.series([updateDojos, deleteDojos, deleteLeads], function (err) {
        delete ctrl.dojosToBeDeleted;
        delete ctrl.dojosToBeUpdated;
        delete ctrl.leadsToBeDeleted;
        ctrl.changedDojos = [];
        ctrl.changedLeads = [];
        if (err) {
          alertService.showError(errorMsg);
        }
        ctrl.loadPage(ctrl.filter, false);
      });
    }
  };

  ctrl.pushChangedDojo = function (dojo) {
    var exists = !!(_.find(ctrl.changedDojos, function (changedDojo) {
      return dojo.id === changedDojo.id;
    }));
    if ((dojo.verified !== dojo.origVerified) || (dojo.toBeDeleted)) {
      if (!exists) ctrl.changedDojos.push(dojo);
    } else if ((dojo.verified === dojo.origVerified) && (!dojo.toBeDeleted)) {
      ctrl.changedDojos = _.filter(ctrl.changedDojos, function (filteredDojo) {
        return dojo.id !== filteredDojo.id;
      });
    }
  };
  ctrl.pushChangedLead = function (dojo) {
    var exists = !!(_.find(ctrl.changedLeads, function (changedDojo) {
      return dojo.dojoLeadId === changedDojo.dojoLeadId;
    }));
    if (dojo.toBeDeleted) {
      if (!exists) ctrl.changedLeads.push(dojo);
    }
  };

  ctrl.toggleSort = function ($event, columnName) {
    var className, descFlag, sortConfig = {};
    var DOWN = 'glyphicon-chevron-down';
    var UP = 'glyphicon-chevron-up';

    function isDesc(className) {
      var result = className.indexOf(DOWN);
      return result > -1 ? true : false;
    }

    className = $($event.target).attr('class');

    descFlag = isDesc(className);
    if (descFlag) {
      sortConfig[columnName] = -1;
    } else {
      sortConfig[columnName] = 1;
    }

    ctrl.sort = sortConfig;
    ctrl.loadPage(ctrl.filter, true);
  }

  ctrl.getUsersByEmails = function (email) {
    if(!email || !email.length || email.length < 3) {
      ctrl.users = [];
      return;
    }

    var win = function(users){
      ctrl.users = users;
    };

    var fail = function(){
      alertService.showError($translate.instant('An error has occurred while loading Dojos'));
    };

    cdUsersService.getUsersByEmails(email, win, fail);
  };
};
angular
    .module('cpZenPlatform')
    .component('cdDojosManage', {
      restrict: 'E',
      templateUrl: '/directives/tpl/dojo/manage',
      controller: ['$state', 'alertService', 'auth',
      'tableUtils', 'cdDojoService', '$location',
      'cdUsersService', '$translate', 'utilsService', 'cdOrganisationsService', '$q', 'cdAgreementsService', ctrller]
    });
}());
