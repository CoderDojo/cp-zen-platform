'use strict';
/*global $*/

function manageDojosCtrl($scope, alertService, auth, tableUtils, cdDojoService, $location, cdUsersService, $translate, utilsService) {
  $scope.filter = {};
  $scope.filter.verified = 1;
  $scope.itemsPerPage = 10;

  var errorMsg = $translate.instant('error.general');

  $scope.pageChanged = function () {
    $scope.loadPage($scope.filter, false);
  };

  var changedDojos = [];

  cdDojoService.getDojoConfig(function(json){
    $scope.dojoStages = _.map(json.dojoStages, function(item){
      return { value: item.value, label: $translate.instant(item.label) };
    });
    $scope.dojoStates = _.map(json.verificationStates, function(item){
      return { value: item.value, label: $translate.instant(item.label) };
    });
  });

  $scope.getDojoStateLabel = function(stage) {
    return (_.find($scope.dojoStages, function(item) { return item.value === parseInt(stage) })).label;
  }

  $scope.setStyle = function(dojo){
    return !allSigned(dojo) || isDeleted(dojo) ? {'background-color' :'rgba(255, 0, 0, 0.05)'} : {'background-color': 'white'};
  };

  function isDeleted (dojo) {
    return dojo.deleted === 1;
  }

  function allSigned(dojo){
    var currentAgreementVersion = 2;
    var creators = dojo.creators;
    var agreements = _.flatten(_.pluck(creators, 'agreements'));
    var signedCreators = [];

    _.each(creators, function(creator){
      var result = _.findWhere(agreements, {agreementVersion: currentAgreementVersion, userId: creator.id});

      if(result){
        signedCreators.push(creator);
      }
    });

    return signedCreators.length === (creators && creators.length);
  }

  $scope.allSigned = allSigned;

  $scope.editDojo = function (dojo) {
    cdDojoService.setDojo(dojo, function (response) {
      $location.path('/dashboard/edit-dojo/'+ dojo.id);
    }, function (err) {
      if (err) {
        alertService.showError(errorMsg);
      }
    });
  };

  $scope.resetFilter = function () {
    $scope.filter = {};
    $scope.filter.verified = 1;

    $scope.loadPage($scope.filter, true);
  };

  $scope.loadPage = function (filter, resetFlag, cb) {
    cb = cb || function () {};
    //sort ascending = -1
    //sort descending = 1
    $scope.sort = $scope.sort ? $scope.sort : { created: 1 };
    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, query);
    $scope.pageNo = loadPageData.pageNo;
    $scope.dojos = [];

    var query = _.omit({
      name: filter.name,
      verified: filter.verified,
      email: filter.email,
      creatorEmail: filter.creatorEmail,
      stage: filter.stage,
      alpha2: filter.country && filter.country.alpha2,
      limit$: $scope.itemsPerPage,
      skip$: loadPageData.skip,
      sort$: $scope.sort
    }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

    cdDojoService.search(query).then(function (result) {
      $scope.dojos = _.map(result, function (dojo) {
        dojo.origVerified = dojo.verified;
        dojo.country = dojo.alpha2.toLowerCase();
        var path = dojo.urlSlug.split('/');
        path.splice(0, 1);
        path = path.join('/');
        dojo.path = path;
        return dojo;
      });
      if($scope.dojos.length > 0) {
        cdDojoService.list(_.omit(query, ['limit$', 'skip$', 'sort$']), function (result) {
          $scope.totalItems = result.length;
        });
      } else {
        $scope.totalItems = 0;
      }
    }, function (err) {
      alertService.showError($translate.instant('An error has occurred while loading Dojos'));
      return cb(err);
    });
  };

  $scope.filterDojos = function () {
    $scope.loadPage($scope.filter, true);
    changedDojos = [];
  };

  $scope.processDojos = function (event) {

    changedDojos = _.map(changedDojos, function (dojo) {
      if (dojo.creatorEmail) {
        delete dojo.creatorEmail;
      }

      if (dojo.agreements) {
        delete dojo.agreements;
      }

      return dojo;
    });

    $scope.dojosToBeDeleted = _.filter(changedDojos, function (changedDojo) {
      return changedDojo.toBeDeleted;
    });

    $scope.dojosToBeUpdated = _.filter(changedDojos, function (changedDojo) {
      return !changedDojo.toBeDeleted;
    });

    function updateDojos(cb) {
      if (_.isEmpty($scope.dojosToBeUpdated)) {
        return cb();
      }
      var dojosToBeUpdated = _.map($scope.dojosToBeUpdated, function (dojo) {
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

    function deleteDojos(cb) {
      if (_.isEmpty($scope.dojosToBeDeleted)) {
        return cb();
      }

      var dojos = _.map($scope.dojosToBeDeleted, function (dojo) {
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

    if($scope.dojosToBeUpdated.length > 0 || $scope.dojosToBeDeleted.length > 0) {
      async.series([updateDojos, deleteDojos], function (err) {
        delete $scope.dojosToBeDeleted;
        delete $scope.dojosToBeUpdated;
        changedDojos = [];
        if (err) {
          alertService.showError(errorMsg);
        }
        $scope.loadPage($scope.filter, false);
      });
    }
  };

  cdDojoService.listCountries(function (countries) {
    $scope.countries = countries;
  });

  $scope.pushChangedDojo = function (dojo) {
    var exists = !!(_.find(changedDojos, function (changedDojo) {
      return dojo.id === changedDojo.id;
    }));
    if((dojo.verified !== dojo.origVerified) || (dojo.toBeDeleted)) {
      if(!exists) changedDojos.push(dojo);
    } else if((dojo.verified === dojo.origVerified) && (!dojo.toBeDeleted)) {
      changedDojos = _.filter(changedDojos, function (filteredDojo) {
        return dojo.id !== filteredDojo.id;
      });
    }
  };

  $scope.toggleSort = function ($event, columnName) {
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

    $scope.sort = sortConfig;
    $scope.loadPage($scope.filter, true);
  }

  $scope.getUsersByEmails = function(email){
    if(!email || !email.length || email.length < 3) {
      $scope.users = [];
      return;
    }

    var win = function(users){
      $scope.users = users;
    };

    var fail = function(){
      alertService.showError($translate.instant('An error has occurred while loading Dojos'));
    };

    cdUsersService.getUsersByEmails(email, win, fail);
  };

  $scope.getDojoIds = function(item){
    if(!item){
      delete $scope.filter.usersDojos ;
      $scope.loadPage($scope.filter, true);
      return;
    }

    var query = {limit$: 'NULL'};
    query.userId = item.id;

    cdDojoService.getUsersDojos(query, function(usersDojos){
      var dojoIds = _.pluck(usersDojos, 'dojoId');

      dojoIds = _.filter(dojoIds, function(dojoId){
        return dojoId !== null;
      });

      $scope.filter.usersDojos = dojoIds;
      $scope.loadPage($scope.filter, true);
    });

  };

  auth.get_loggedin_user(function () {
    $scope.loadPage($scope.filter, true);
  });

  $scope.getSortClass = utilsService.getSortClass;
}

angular.module('cpZenPlatform')
  .controller('manage-dojo-controller',
  ['$scope', 'alertService', 'auth',
  'tableUtils', 'cdDojoService', '$location',
  'cdUsersService', '$translate', 'utilsService', manageDojosCtrl]);
