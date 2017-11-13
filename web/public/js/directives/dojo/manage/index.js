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
    var _query = {};
    var payload = {
      verified: ctrl.filter.verified,
      deleted: ctrl.filter.deleted,
      dojoName: ctrl.filter.name,
      dojoEmail: ctrl.filter.email,
      email: ctrl.filter.creatorEmail,
      stage: ctrl.filter.stages,
      alpha2: ctrl.filter.country && ctrl.filter.country.alpha2
    };
    var baseFields = {
      dojo: ['verified', 'email', 'stage', 'alpha2', 'deleted'],
      lead: ['email', 'deleted'],
      dojolead: _.keys(payload)
    };
    var selectedFields = baseFields[target];
    _query = _.omitBy(payload, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

    return _.pick(_query, selectedFields);
  };

  ctrl.getDojoStageLabel = function(stage) {
    if (stage)
      return (_.find(ctrl.dojoStages, function(item) { return item.value === parseInt(stage) })).label;
    return '';
  };

  ctrl.setStyle = function (dojo) {
    var signed = allSigned(_.isEmpty(dojo.owners) ? [dojo.creator] : dojo.owners);
    var deleted = isDeleted(dojo);
    return !signed || deleted ? {'background-color': 'rgba(255, 0, 0, 0.05)'} : {'background-color': 'white'};
  };

  function isDeleted (dojo) {
    return dojo.deleted === 1;
  }

  function allSigned (owners) {
    if (ctrl.agreements) {
      return _.every(owners, function (owner) {
        return _.find(ctrl.agreements, {'userId': owner.id});
      });
    }
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
    var orderKeys = ['verifiedAt', 'completedAt'];
    var orderKeyIndex = ctrl.filter.verified === 1 ? 0 : 1;
    var orderKey = orderKeys[orderKeyIndex];
    var order = {}; order[orderKey] = -1;
    var alternativeKey = orderKeys[Number(!orderKeyIndex)];
    if (ctrl.sort && ctrl.sort[alternativeKey]) {
      delete ctrl.sort[alternativeKey];
    }
    if (!ctrl.sort || !_.has(ctrl.sort, orderKey)) {
      // Only one of those can be set at a time
      ctrl.sort = _.extend({}, ctrl.sort, order);
    }
    ctrl.dojos = [];
    var loadPageData = tableUtils.loadPage(resetFlag, ctrl.itemsPerPage, ctrl.pageNo);
    ctrl.pageNo = loadPageData.pageNo;
    ctrl.skip = loadPageData.skip;
    function getDojoLeads () {
      var query = ctrl.buildQuery('dojolead');
      query.limit$ = ctrl.itemsPerPage;
      query.skip$ = ctrl.skip;
      query.sort$ = ctrl.sort;
      if (ctrl.filter.verified === 0) query.completed = true;
      query = _.omitBy(query, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });
      return cdDojoService.searchDojoleads(query)
      .then(function (res) {
        ctrl.res = res.data;
        if (!ctrl.res) return $q.reject();
      });
    }
    function getDojos () {
      var query = ctrl.buildQuery('dojo');
      if (ctrl.res && ctrl.res.length > 0) {
        var ids = _.map(ctrl.res, 'id');
        query.dojoLeadId = {in$: ids};
        query.name = ctrl.filter.name;
        query.email = ctrl.filter.email;
        query.creatorEmail = ctrl.filter.creatorEmail;
        query.sort$ = (function () { // We need to map dojoleads fields to dojos's structure
          var sort = {};
          if (ctrl.sort.dojoEmail) sort.email = ctrl.sort.dojoEmail;
          if (ctrl.sort.dojoName) sort.name = ctrl.sort.dojoName;
          if (ctrl.sort.verifiedAt) sort.verifiedAt = ctrl.sort.verifiedAt;
          if (ctrl.sort.createdAt) sort.created = ctrl.sort.createdAt;
          if (ctrl.sort.country) sort.country = ctrl.sort.country;
          return _.isEmpty(sort) ? {ctid: -1} : sort;
        })();
        query = _.omitBy(query, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });
        return cdDojoService.search(query)
        .then(function (result) {
          if(!_.isUndefined(result.ok) && result.ok === false){
            $state.go('error-404-no-headers');
            return $q.reject();
          }
          ctrl.dojos = ctrl.formatDojos(result);
          _.each(ctrl.dojos, function (dojo, index) {
            var lead = _.find(ctrl.res, function (lead) { return lead.id === dojo.dojoLeadId });
            if (lead) {
              ctrl.dojos[index] = _.merge({}, lead, dojo); // order matter, we want in priority the dojo fields
            }
            ctrl.dojos[index].owners = dojo.creators;
          });
          return $q.resolve();
        })
        .then(function () {
          if (ctrl.dojos.length > 0) {
            var _query = ctrl.buildQuery('dojolead');
            if (ctrl.filter.verified === 0) _query.completed = true;
            return cdDojoService.searchDojoleads(_query)
            .then(function (result) {
              ctrl._dojoLength = result.data.length;
            });
          } else {
            ctrl._dojoLength = 0;
            return $q.resolve();
          }
        })
        .catch(function (err) {
          alertService.showError($translate.instant('An error has occurred while loading Dojos'));
          return $q.reject(err);
        });
      } else {
        ctrl._dojoLength = 0;
      }
    }
    function getUncompletedLeads () {
      var query;
      // We only display uncompleted leads when the unverified filter is set manually
      if (ctrl.filter.verified === 0) {
        query = _.extend(ctrl.buildQuery('dojolead'), {completed: false});
        query.limit$ = ctrl.itemsPerPage;
        query.skip$ = ctrl.skip;
        query.sort$ = (function () {
          var sort = _.clone(ctrl.sort);
          delete sort.completedAt;
          return _.extend(sort,{ updatedAt: ctrl.sort.completedAt || -1 });
        })();
        query = _.omitBy(query, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });
        return cdDojoService.searchDojoleads(query)
        .then(function (res) {
          return $q.resolve(res.data);
        })
        .then(function (leads) {
          if (leads.length > 0) {
            var query = {id: {in$: _.map(leads, 'id')}};
            return cdDojoService.searchLeads(query)
            .then(function (res) {
              var filteredLeads = res.data;
              ctrl.leads = ctrl.formatDojos(_.map(filteredLeads, function (lead) {
                return _.extend(lead.application.dojo, lead.application.venue, {
                  dojoLeadId: lead.id,
                  creator: lead.userId,
                  creatorEmail: lead.email,
                  owners: [], // You can't have anybody but self
                  deleted: lead.deleted,
                  completed: lead.completed,
                  completedAt: lead.completedAt,
                  updatedAt: lead.updatedAt
                });
              }));
              return $q.resolve();
            });
          } else {
            ctrl.leads = [];
          }
        })
        .then(function () {
          // Set pagination
          if (ctrl.leads && ctrl.leads.length > 0) {
            return cdDojoService.searchDojoleads(_.extend(ctrl.buildQuery('dojolead'), {completed: false}))
            .then(function (res) {
              var leads = res.data;
              ctrl._leadLength = leads.length;
              // Filter uncompleted leads
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
    function getUserOrg () {
      var userIds = _.compact(_.map(ctrl.dojos, 'creator').concat(_.map(ctrl.leads, 'userId')));
      return cdOrganisationsService.loadUsersOrg({userIds: userIds})
      .then(function (userOrgs) {
        ctrl.userOrgs = {};
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
      var userIds = _.compact(_.map(_.flatten(_.map(ctrl.dojos, 'owners')), 'id').concat(_.map(ctrl.leads, 'creator')));
      if (userIds.length === 0) userIds = _.compact(_.flatten(_.map(ctrl.dojos, 'creator')));
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
    function setStyling () {
      _.each(ctrl.leads, function (lead, index) {
        ctrl.leads[index].style = ctrl.setStyle(lead);
      });
      _.each(ctrl.dojos, function (dojo, index) {
        ctrl.dojos[index].allSigned = ctrl.allSigned(dojo.owners);
        ctrl.dojos[index].style = ctrl.setStyle(dojo);
      });
      return $q.resolve();
    }
    getDojoLeads()
    .then(getDojos)
    .then(function () {
      return $q.all([
        getUncompletedLeads(),
        getUserOrg(),
        getOrgs(),
        getCharters()]);
    })
    .then(setStyling)
    .then(function () {
      // Set pagination
      ctrl.totalItems = _.max([ctrl._dojoLength, ctrl._leadLength]);
    });
  };

  ctrl.formatDojos = function (map) {
    return _.map(map, function (dojo) {
      if (!_.isUndefined(dojo)) {
        dojo.origVerified = dojo.verified;
        dojo.alpha2 = dojo.alpha2 || (dojo.country ? dojo.country.alpha2.toUpperCase() : '');
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
          creator: dojo.creator.id,
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
