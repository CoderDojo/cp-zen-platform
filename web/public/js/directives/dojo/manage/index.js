;(function() {
'use strict';
/*global $*/
var ctrller = function ($state, alertService, auth, tableUtils, cdDojoService,
   $location, cdUsersService, $translate, utilsService, cdOrganisationsService) {
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
    ctrl.selectedStages = [];
    ctrl.itemsPerPage = 10;
    ctrl.getSortClass = utilsService.getSortClass;
    ctrl.changedDojos = [];
    cdDojoService.getDojoConfig(function (json) {
      ctrl.dojoStages = _.map(json.dojoStages, function (item) {
        // Duplicate value/id so that we can support legacy code while using multiselect
        return { id: item.value, value: item.value, label: $translate.instant(item.label), active: (item.value !== 4) };
      });
      ctrl.selectedStages = _.filter(ctrl.dojoStages, function (stage) {
        return stage.id != 4;
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

  ctrl.getDojoStageLabel = function(stage) {
    if (stage)
      return (_.find(ctrl.dojoStages, function(item) { return item.value === parseInt(stage) })).label;
    return '';
  };

  ctrl.setStyle = function(dojo){
    return !allSigned(dojo) || isDeleted(dojo) ? {'background-color' : 'rgba(255, 0, 0, 0.05)'} : {'background-color': 'white'};
  };

  function isDeleted (dojo) {
    return dojo.deleted === 1;
  }

  function allSigned (dojo) {
    var currentAgreementVersion = 2;
    var creators = dojo.creators;
    var agreements = _.flatten(_.map(creators, 'agreements'));
    var signedCreators = [];

    _.each(creators, function (creator) {
      var result = _.find(agreements, {agreementVersion: currentAgreementVersion, userId: creator.id});

      if (result) {
        signedCreators.push(creator);
      }
    });

    return signedCreators.length === (creators && creators.length);
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
  ctrl.loadPage = function (filter, resetFlag, cb) {
    cb = cb || function () {};
    //sort ascending = 1
    //sort descending = -1
    ctrl.sort = ctrl.sort ? ctrl.sort : { created: -1 };
    var loadPageData = tableUtils.loadPage(resetFlag, ctrl.itemsPerPage, ctrl.pageNo, query);
    ctrl.pageNo = loadPageData.pageNo;
    ctrl.dojos = [];

    var query = _.omitBy({
      name: ctrl.filter.name,
      verified: ctrl.filter.verified,
      email: ctrl.filter.email,
      creatorEmail: ctrl.filter.creatorEmail,
      stage: ctrl.filter.stages,
      alpha2: ctrl.filter.country && ctrl.filter.country.alpha2,
      limit$: ctrl.itemsPerPage,
      skip$: loadPageData.skip,
      sort$: ctrl.sort
    }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

    cdDojoService.search(query).then(function (result) {
      if(!_.isUndefined(result.ok) && result.ok === false){
        $state.go('error-404-no-headers');
        return cb();
      }
      ctrl.dojos = ctrl.formatDojos(result);
      if(ctrl.dojos.length > 0) {
        cdDojoService.list(_.omit(query, ['limit$', 'skip$', 'sort$']), function (result) {
          ctrl.totalItems = result.length;
        });
      } else {
        ctrl.totalItems = 0;
      }
    }, function (err) {
      alertService.showError($translate.instant('An error has occurred while loading Dojos'));
      return cb(err);
    })
    .then(function () {
      cdDojoService.searchDojoLeads({completed: false})
      .then(function (res) {
        var leads = res.data;
        var leadsIds = _.map(leads, 'id');
        ctrl.dojos = _.omitBy(ctrl.dojos, function (dojo) {
          return leadsIds.indexOf(dojo.leadId) > -1;
        });
        ctrl.leads = ctrl.formatDojos(_.map(leads, function (lead) {
          return _.extend(lead.application.dojo, lead.application.venue, {
            dojoLeadId: lead.id
          });
        }));
      });
    })
    .then(function () {
      return cdOrganisationsService.loadUsersOrg({userIds: _.map(ctrl.dojos, 'creator')})
      .then(function (userOrgs) {
        ctrl.userOrg = {};
        _.each(userOrgs.data, function (userOrg) {
          ctrl.userOrgs[userOrg.userId] = userOrg;
        });
      });
    })
    .then(function () {
      return cdOrganisationsService.list({query: {orgIds: _.map(ctrl.userOrgs, 'orgId')}})
      .then(function (orgs) {
        ctrl.orgs = {};
        _.each(orgs.data, function (org) {
          ctrl.orgs[org.id] = org;
        });
      });
    });
  };

  ctrl.formatDojos = function (map) {
    return _.map(map, function (dojo) {
      if (!_.isUndefined(dojo)) {
        dojo.origVerified = dojo.verified;
        dojo.country = dojo.alpha2 ? dojo.alpha2.toLowerCase() : '';
        dojo.path = dojo.urlSlug ? dojo.urlSlug.split('/').splice(0, 1).join('/') : '';
      } else {
        return {};
      }
      return dojo;
    });
  };

  ctrl.filterDojos = function () {
    ctrl.loadPage(ctrl.filter, true);
    ctrl.changedDojos = [];
  };
  ctrl.processDojos = function (event) {
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

    function updateDojos(cb) {
      if (_.isEmpty(ctrl.dojosToBeUpdated)) {
        return cb();
      }
      var dojosToBeUpdated = _.map(ctrl.dojosToBeUpdated, function (dojo) {
        return {
          id: dojo.id,
          verified: dojo.verified,
          dojoLeadId: dojo.dojoLeadId
        }
      });

      cdDojoService.bulkUpdate(dojosToBeUpdated).then(function (response) {
        alertService.showAlert($translate.instant('Dojo has been successfully updated'));

        return cb();
      }, function (err) {
        alertService.showError(errorMsg);

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

    if (ctrl.dojosToBeUpdated.length > 0 || ctrl.dojosToBeDeleted.length > 0) {
      async.series([updateDojos, deleteDojos], function (err) {
        delete ctrl.dojosToBeDeleted;
        delete ctrl.dojosToBeUpdated;
        ctrl.changedDojos = [];
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
    if((dojo.verified !== dojo.origVerified) || (dojo.toBeDeleted)) {
      if(!exists) ctrl.changedDojos.push(dojo);
    } else if((dojo.verified === dojo.origVerified) && (!dojo.toBeDeleted)) {
      ctrl.changedDojos = _.filter(ctrl.changedDojos, function (filteredDojo) {
        return dojo.id !== filteredDojo.id;
      });
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

  ctrl.getDojoIds = function (item) {
    if(!item){
      delete ctrl.filter.usersDojos ;
      ctrl.loadPage(ctrl.filter, true);
      return;
    }

    var query = {limit$: 'NULL'};
    query.userId = item.id;

    cdDojoService.getUsersDojos(query, function(usersDojos){
      var dojoIds = _.map(usersDojos, 'dojoId');

      dojoIds = _.filter(dojoIds, function(dojoId){
        return dojoId !== null;
      });

      ctrl.filter.usersDojos = dojoIds;
      ctrl.loadPage(ctrl.filter, true);
    });

  };
};
angular
    .module('cpZenPlatform')
    .component('cdDojosManage', {
      restrict: 'E',
      templateUrl: '/directives/tpl/dojo/manage',
      controller: ['$state', 'alertService', 'auth',
      'tableUtils', 'cdDojoService', '$location',
      'cdUsersService', '$translate', 'utilsService', 'cdOrganisationsService', ctrller]
    });
}());
