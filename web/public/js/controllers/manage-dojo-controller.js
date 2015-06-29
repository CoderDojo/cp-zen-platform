'use strict';

function manageDojosCtrl($scope, alertService, auth, tableUtils, cdDojoService, $location, cdCountriesService, cdUsersService, $translate) {
  $scope.filter = {};
  $scope.filter.verified = 1;
  $scope.itemsPerPage = 10;

  $scope.pageChanged = function () {
    $scope.loadPage($scope.filter, false);
  };

  var verificationStates = [
    {label: $translate.instant('Unverified'), value: 0},
    {label: $translate.instant('Verified'), value: 1},
    {label: $translate.instant('Previous'), value: 2}
  ];

  var changedDojos = [];

  $scope.getVerificationStates = function (dojo) {
    var states = verificationStates.slice();

    if (!allSigned(dojo)) {
      
      states = _.reject(states, function (state) { return state.value === 1 });
    }

    return states;
  };

  $scope.setStyle = function(dojo){
    return !allSigned(dojo) ? {'background-color' :'rgba(255, 0, 0, 0.05)'} : {'background-color': 'white'};
  };

  function allSigned(dojo){
    // TODO: single origin point for current agreement version
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
        alertService.showError(
          $translate.instant('An error has occurred while editing dojo') +' <br /> ' +
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
    var filteredBoolQuery = {bool: {must: []}};

    $scope.sort = $scope.sort ? $scope.sort :[{ created: 'desc' }];

    if(filter.email){
      var emailQuery = {
        "regexp" : {
          "email" : {
            "value": ".*" + filter.email + ".*"
          }
        }
      };
      filteredBoolQuery.bool.must.push(emailQuery); 
    }

    if(filter.name){
      var nameQuery = {
        "regexp": {
          "name": {
            "value": ".*" + filter.name + ".*"
          }
        }
      };
      filteredBoolQuery.bool.must.push(nameQuery);
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
    filteredQuery.query.filtered.filter = {bool: {must: []}};

    if (!_.isEmpty(query)) {

      var andFilter = {
        and: _.map(query, function (value, key) {
          var term = {};
          term[key] = value.toLowerCase ? value.toLowerCase() : value;
          return {term: term};
        })
      };

      filteredQuery.query.filtered.filter.bool.must.push(andFilter);

    }

    if($scope.filter.usersDojos && $scope.filter.usersDojos.length > 0){
      var idsFilter =  {ids : {'values': $scope.filter.usersDojos}};
      filteredQuery.query.filtered.filter.bool.must.push(idsFilter);
    } else if(typeof $scope.filter.usersDojos !== 'undefined'){
      $scope.dojos = [];
      $scope.totalItems = 0;
      alertService.showError($translate.instant('An error has occurred while loading Dojos'));
      return;
    }

    filteredQuery.query.filtered.query = filteredBoolQuery;
    cdDojoService.search(filteredQuery).then(function (result) {
      $scope.dojos = _.map(result.records, function (dojo) {
        dojo.verified = _.findWhere(verificationStates, {value: dojo.verified});
        return dojo;
      });

      $scope.totalItems = result.total;

      return cb();
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
          verified: dojo.verified.value,
          dojoLeadId: dojo.dojoLeadId
        }
      });

      cdDojoService.bulkUpdate(dojosToBeUpdated).then(function (response) {
        // TODO: review, should notify user on successfull update?

        return cb();
      }, function (err) {
        alertService.showError($translate.instant("An error has occurred while updating Dojos") + ' <br>' +
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
        alertService.showError($translate.instant('An error has occurred while deleting Dojos') + ' <br>' +
        (err.error || JSON.stringify(err)));

        cb(err);
      });
    }

    async.series([updateDojos, deleteDojos], function (err) {
      delete $scope.dojosToBeDeleted;
      delete $scope.dojosToBeUpdated;
      changedDojos = [];
      if (err) {
        alertService.showError($translate.instant('An error has occurred while updating Dojos') + ' <br>' +
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
    var ACTIVE_COL = 'green-text';
    var ACTIVE_COL_CLASS = ".green-text";

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
    query.user_id = item.id;

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
}

angular.module('cpZenPlatform')
  .controller('manage-dojo-controller',
  ['$scope', 'alertService', 'auth', 
  'tableUtils', 'cdDojoService', '$location', 
  'cdCountriesService', 'cdUsersService', '$translate', manageDojosCtrl]);

