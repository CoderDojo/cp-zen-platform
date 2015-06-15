 'use strict';

function cdDojoEventsCtrl($scope, cdEventsService, tableUtils, alertService) {
  var dojoId = $scope.dojoId;
  $scope.filter = {dojoId:dojoId};
  $scope.itemsPerPage = 10;

  $scope.pageChanged = function () {
    $scope.loadPage($scope.filter, false);
  };


  $scope.loadPage = function (filter, resetFlag, cb) {
    cb = cb || function () {};
    var filteredQuery = { query: { filtered: {}}};
    var filteredBoolQuery = {bool: {must: []}};

    $scope.sort = $scope.sort ? $scope.sort :[{ date: 'desc' }];

    var query = _.omit({
      dojoId: filter.dojoId,
    }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, query);
    $scope.pageNo = loadPageData.pageNo;
    $scope.events = [];

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

    filteredQuery.query.filtered.query = filteredBoolQuery;
    
    //TODO: implement elasticsearch query
    cdEventsService.list($scope.filter, function (result) {
      $scope.events = result;
      $scope.totalItems = result.length;
      return cb();
    }, function (err) {
      alertService.showError($translate.instant('An error has occurred while loading Dojo Events'));
      return cb(err);
    });
  }

  $scope.loadPage($scope.filter, true);

  //TODO: implement applyForEvent function

}

angular.module('cpZenPlatform')
    .controller('dojo-events-controller', ['$scope', 'cdEventsService', 'tableUtils', 'alertService', cdDojoEventsCtrl]);