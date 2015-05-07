'use strict';

function manageDojosCtrl($scope, alertService, auth, tableUtils, cdDojoService, $location, cdCountriesService, cdUsersService, cdProfilesService) {
  $scope.filter = {};
  $scope.filter.verified = 1;
  $scope.itemsPerPage = 10;

  $scope.pageChanged = function () {
    $scope.loadPage($scope.filter, false);
  };

  var verificationStates = [
    {label: 'Unverified', value: 0},
    {label: 'Verified', value: 1},
    {label: 'Previous', value: 2}
  ];

  var changedDojos = [];

  $scope.getVerificationStates = function (agreements) {
    var states = verificationStates.slice();

    // TODO: single origin point for current agreement version
    var currentAgreementVersion = 2;
    if (!_.any(agreements, function (agreement) {
        return agreement.agreementVersion === currentAgreementVersion;
      })) {
      
      states = _.reject(states, function (state) { return state.value === 1 });
    }

    return states;
  };

  $scope.setStyle = function(agreements){
    // TODO: single origin point for current agreement version
    var currentAgreementVersion = 2;

    var isSigned  = _.any(agreements, function(agreement) {
      return agreement.agreementVersion === currentAgreementVersion;
    });

    return !isSigned ? {color:'red'} : {color: 'black'};
  };

  $scope.editDojo = function (dojo) {
    cdDojoService.setDojo(dojo, function (response) {
      $location.path('/dashboard/edit-dojo');
    }, function (err) {
      if (err) {
        alertService.showError(
          'An error has occurred while editing dojo: <br /> ' +
          (err.error || JSON.stringify(err))
        );
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
    var filteredQuery = { query: { filtered: {}}};

    $scope.sort = $scope.sort ? $scope.sort :[{ created: 'desc' }];

    if(filter.email){
      filteredQuery.query.filtered.query = {
        "regexp" : {
          "email" : {
            "value": ".*" + filter.email + ".*"
          }
        }
      };
    }

    var query = _.omit({
      verified: filter.verified,
      stage: filter.stage,
      alpha2: filter.country && filter.country.alpha2
    }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, query);
    $scope.pageNo = loadPageData.pageNo;
    $scope.dojos = [];

    var meta = {
      sort: $scope.sort,
      from: loadPageData.skip,
      size: $scope.itemsPerPage
    };

    filteredQuery = _.extend(filteredQuery, meta);

    if (!_.isEmpty(query)) {
      filteredQuery.query.filtered.filter = {
        and: _.map(query, function (value, key) {
          var term = {};
          term[key] = value.toLowerCase ? value.toLowerCase() : value;
          return {term: term};
        })
      };
    }


    cdDojoService.search(filteredQuery).then(function (result) {
      $scope.dojos = _.map(result.records, function (dojo) {
        dojo.verified = _.findWhere(verificationStates, {value: dojo.verified});
        return dojo;
      });

      $scope.totalItems = result.total;

      return cb();
    }, function (err) {
      alertService.showError('An error has occurred while loading Dojos: <br>' +
        (err.error || JSON.stringify(err))
      );

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
          verified: dojo.verified.value
        }
      });

      cdDojoService.bulkUpdate(dojosToBeUpdated).then(function (response) {
        // TODO: review, should notify user on successfull update?

        return cb();
      }, function (err) {
        alertService.showError('An error has occurred while updating Dojos: <br>' +
        (err.error || JSON.stringify(err)));

        cb(err);
      });
    }

    function deleteDojos(cb) {
      if (_.isEmpty($scope.dojosToBeDeleted)) {
        return cb();
      }

      var dojos = _.map($scope.dojosToBeDeleted, function (dojo) {
        return {id: dojo.id, creator: dojo.creator};
      });

      cdDojoService.bulkDelete(dojos).then(function (response) {
        // TODO: review, should notify user on successfull delete?

        return cb();
      }, function (err) {
        alertService.showError('An error has occurred while deleting Dojos: <br>' +
        (err.error || JSON.stringify(err)));

        cb(err);
      });
    }

    async.series([updateDojos, deleteDojos], function (err) {
      delete $scope.dojosToBeDeleted;
      delete $scope.dojosToBeUpdated;
      changedDojos = [];
      if (err) {
        alertService.showError('An error has occurred while updating Dojos: <br>' +
        (err.error || JSON.stringify(err)));
      }
      $scope.loadPage($scope.filter, false);
    });
  };

  cdCountriesService.listCountries(function (countries) {
    $scope.countries = _.map(countries, function (country) {
      return _.omit(country, 'entity$');
    });
  });


  $scope.pushChangedDojo = function (dojo) {
    var filterVerified, exists = !!(_.find(changedDojos, function (changedDojo) {
      return dojo.id === changedDojo.id;
    }));


    filterVerified = $scope.filter && $scope.filter.verified;

    if ((dojo.verified.value !== filterVerified) || (dojo.toBeDeleted)) {
      if (!exists) {
        changedDojos.push(dojo);
      }

    } else if (dojo.verified.value === filterVerified && !dojo.toBeDeleted) {
      changedDojos = _.filter(changedDojos, function (filteredDojo) {
        return dojo.id !== filteredDojo.id;
      });
    }

  };

  $scope.toggleSort = function ($event, columnName) {
    var className, descFlag, sortConfig = {},sort = [], currentTargetEl;
    
    var DOWN = 'glyphicon-chevron-down';
    var UP = 'glyphicon-chevron-up';
    var ACTIVE_COL = 'active-column';
    var ACTIVE_COL_CLASS = ".active-column";

    function isDesc(className) {
      var result = className.indexOf(DOWN);

      return result > -1 ? true : false;
    }

    currentTargetEl = angular.element($event.currentTarget);

    className = $event.currentTarget.className;

    angular.element(ACTIVE_COL_CLASS).removeClass(ACTIVE_COL);

    descFlag = isDesc(className);

    if (descFlag) {
      sortConfig[columnName] = {order: "asc"};
      sort.push(sortConfig);

      currentTargetEl
        .removeClass(DOWN)
        .addClass(UP);
      }
      else {
        sortConfig[columnName] = {order: "desc"};
        sort.push(sortConfig);
        currentTargetEl
          .removeClass(UP)
          .addClass(DOWN);
      }

      currentTargetEl.addClass(ACTIVE_COL);

    angular.element("span.sortable")
      .not(ACTIVE_COL_CLASS)
      .removeClass(UP)
      .addClass(DOWN);

    $scope.sort = sort;
    $scope.loadPage($scope.filter, true);
  };

  $scope.getUsersByEmails = function(email){
    if(!email || !email.length || email.length < 3) {
      $scope.users = [];
      return;
    }
    var win = function(users){
      console.log(users);
      $scope.users = users;
    };

    //TODO add failure callback
    cdUsersService.getUsersByEmails(email, win);
  };

  $scope.getDojoIds = function(item){
    if(!item){
      $scope.loadPage($scope.filter, true);
      return;
    }

    cdProfilesService.getProfiles(item.id, function(profiles){
      console.log(profiles);
      var dojoIds = _.pluck(profiles, 'dojoId');
      var query = {filter: {ids : {"values": dojoIds}}};

      

      cdDojoService.search(query).then(function (result) {
        $scope.dojos = _.map(result.records, function (dojo) {
          dojo.verified = _.findWhere(verificationStates, {value: dojo.verified});
          return dojo;
        });

        $scope.totalItems = result.total;

        
      }, function (err) {
        alertService.showError('An error has occurred while loading Dojos: <br>' +
          (err.error || JSON.stringify(err))
        );

      });


    });

  };


  auth.get_loggedin_user(function () {
    $scope.loadPage($scope.filter, true);
  });
}

angular.module('cpZenPlatform')
  .controller('manage-dojo-controller',
  ['$scope', 'alertService', 'auth', 
  'tableUtils', 'cdDojoService', '$location', 
  'cdCountriesService', 'cdUsersService', 'cdProfilesService', manageDojosCtrl]);

