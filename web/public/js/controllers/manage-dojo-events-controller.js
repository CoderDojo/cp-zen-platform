(function() {
  'use strict';

  function manageDojoEventsCtrl($scope, $stateParams, $state, $location, cdDojoService, cdEventsService, tableUtils, $translate, auth) {
    $scope.dojoId = $stateParams.dojoId;
    $scope.filter = {dojoId: $scope.dojoId};
    $scope.itemsPerPage = 10;
    $scope.pagination = {};
    $scope.manageDojoEventsPageTitle = $translate.instant('Manage Dojo Events'); //breadcrumb page title

    auth.get_loggedin_user(function (user) {
      cdDojoService.getUsersDojos({userId: user.id, dojoId: $scope.dojoId}, function (response) {
        var userDojo = response[0];
        $scope.isTicketingAdmin = _.find(userDojo.userPermissions, function (permission) {
          return permission.name === 'ticketing-admin';
        });
      });
    });

    cdDojoService.load($scope.dojoId, function (response) {
      $scope.dojo = response;
    });

    $scope.pageChanged = function () {
      $scope.loadPage($scope.filter, false);
    }

    $scope.createEvent = function() {
      $state.go('create-dojo-event', {dojoId: $scope.dojoId});
    }

    $scope.updateEventStatus = function(event, status) {
      delete event.formattedDate;
      event.status = status;
      cdEventsService.saveEvent(event, function (response) {
        $scope.loadPage($scope.filter, true);
      });
    }
        
    $scope.loadPage = function (filter, resetFlag, cb) {
      cb = cb || function () {};
      //Only list events for this Dojo
      var dojoQuery = { query: {
                          bool: {
                            must:[
                              { match: { dojoId: $scope.dojoId }}
                            ]
                          }
                        }
                      };

      $scope.sort = $scope.sort ? $scope.sort :[{ dates: {order: 'asc', ignore_unmapped: true }}];

      var query = _.omit({
        dojoId: filter.dojoId,
      }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

      var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pagination.pageNo, query);
      $scope.pagination.pageNo = loadPageData.pageNo;
      $scope.events = [];

      var meta = {
        sort: $scope.sort,
        from: loadPageData.skip,
        size: $scope.itemsPerPage
      };

      dojoQuery = _.extend(dojoQuery, meta);

      cdEventsService.search(dojoQuery).then(function (result) {
        var events = [];
        _.each(result.records, function (event) {

          if(event.type === 'recurring') {
            var startDate = event.dates[0];
            var lastIndex = event.dates.length - 1;
            var endDate = event.dates[lastIndex];
            event.formattedDate = moment(startDate).format('MMMM Do YYYY') + ' - ' + moment(endDate).format('MMMM Do YYYY');
          } else {
            //One-off event
            var eventDate = event.dates[0];
            event.formattedDate = moment(eventDate).format('MMMM Do YYYY');
          }
          
          //Retrieve number of applicants & attendees
          var cdApplicationsQuery = {query:{match:{eventId:event.id}}};
          cdEventsService.searchApplications(cdApplicationsQuery, function (result) {
            var numOfApplicants = result.total;
            var numAttending = 0;
            _.each(result.records, function (application) {
              if(application.status === 'approved') numAttending++;
            })
            event.applicants = numOfApplicants;
            event.attending = numAttending;
          });
          events.push(event);
        });
        $scope.events = events;
        $scope.totalItems = result.total;
        return cb();
      });
    }

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
        sortConfig[columnName] = {order: "asc", ignore_unmapped:true};
        sort.push(sortConfig);

        currentTargetEl
          .removeClass(DOWN)
          .addClass(UP);
      } else {
        sortConfig[columnName] = {order: "desc", ignore_unmapped:true};
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
    }

    $scope.loadPage($scope.filter, true);

  }

  angular.module('cpZenPlatform')
    .controller('manage-dojo-events-controller', ['$scope', '$stateParams', '$state', '$location', 'cdDojoService', 'cdEventsService', 'tableUtils', '$translate', 'auth', manageDojoEventsCtrl]);

})();

