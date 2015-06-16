 'use strict';

function cdDojoEventsCtrl($scope, cdEventsService, tableUtils, alertService) {
  var dojoId = $scope.dojoId;
  $scope.filter = {dojo_id:dojoId};
  $scope.itemsPerPage = 10;

  $scope.pageChanged = function () {
    $scope.loadPage($scope.filter, false);
  };


  $scope.loadPage = function (filter, resetFlag, cb) {
    cb = cb || function () {};
    //Only list events for this Dojo
    var dojoQuery = { query: { match: { dojo_id: dojoId }}};
    $scope.sort = $scope.sort ? $scope.sort :[{ date: 'desc' }];

    var query = _.omit({
      dojo_id: filter.dojo_id,
    }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, query);
    $scope.pageNo = loadPageData.pageNo;
    $scope.events = [];

    var meta = {
      sort: $scope.sort,
      from: loadPageData.skip,
      size: $scope.itemsPerPage
    };

    dojoQuery = _.extend(dojoQuery, meta);
    
    cdEventsService.search(dojoQuery).then(function (result) {
      var events = [];
      _.each(result.hits, function (event) {
        events.push(event._source);
      });
      $scope.events = events;
      $scope.totalItems = result.total;
      return cb();
    });
  }

  $scope.loadPage($scope.filter, true);

  //TODO: implement applyForEvent function

}

angular.module('cpZenPlatform')
    .controller('dojo-events-controller', ['$scope', 'cdEventsService', 'tableUtils', 'alertService', cdDojoEventsCtrl]);
