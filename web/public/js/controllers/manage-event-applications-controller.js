(function () {
  'use strict';
  /*global $*/

  function manageEventApplicationsControllerCtrl($scope, $stateParams, $state, $translate, $modal, alertService, cdEventsService, tableUtils,
    cdDojoService, cdUsersService, AlertBanner, utilsService, usSpinnerService, currentUser) {

    var eventId = $stateParams.eventId;
    var dojoId = $stateParams.dojoId;
    $scope.dojoId = dojoId;
    var applicationCheckInDates = [];
    currentUser = currentUser.data;

    $scope.sort = undefined;
    $scope.pagination = {itemsPerPage: 10};
    $scope.newApplicant = {};
    $scope.eventStats = {totalAttending:0, totalWaitlist: 0};
    $scope.sessionStats = {};
    $scope.filter = {};

    $scope.attendanceDropdownSettings = {
      idProp: 'date',
      externalIdProp: '',
      displayProp: 'date',
      showUncheckAll: false,
      showCheckAll: false,
      scrollableHeight: '200px',
      scrollable: true
    };

    $scope.attendanceDropdownEvents = {
      onItemSelect: function (item) {
        item.attended = true;
        item.dojoId = dojoId;
        cdEventsService.updateApplicationAttendance(item, null, function (err) {
          if(err) console.error(err);
        });
      },
      onItemDeselect: function (item) {
        item.attended = false;
        item.dojoId = dojoId;
        cdEventsService.updateApplicationAttendance(item, null, function (err) {
          if(err) console.error(err);
        });
      }
    }

    $scope.ticketTypes = [
      {name: 'ninja', title: 'Ninja' },
      {name: 'parent-guardian', title: 'Parent/guardian'},
      {name: 'mentor', title: 'Mentor'},
      {name: 'other', title: 'Other'}
    ];

    cdEventsService.getEvent(eventId, function (event) {
      event.guestListDownloadLink = '/api/2.0/events/export-guest-list/' + event.id;

      var startDateUtcOffset = moment(_.first(event.dates).startTime).utcOffset();
      var endDateUtcOffset = moment(_.first(event.dates).endTime).utcOffset();

      var startDate = moment.utc(_.first(event.dates).startTime).subtract(startDateUtcOffset, 'minutes').toDate();
      var endDate = moment.utc(_.first(event.dates).endTime).subtract(endDateUtcOffset, 'minutes').toDate();

      if(event.type === 'recurring') {
        event.formattedDates = [];
        _.each(event.dates, function (eventDate) {
          event.formattedDates.push(moment(eventDate.startTime).format('Do MMMM YY'));
        });

        event.day = moment(startDate).format('dddd');
        event.time = moment(startDate).format('HH:mm') + ' - ' + moment(endDate).format('HH:mm');

        if(event.recurringType === 'weekly') {
          event.formattedRecurringType = $translate.instant('Weekly');
          event.formattedDate = $translate.instant('Weekly') + " " +
            $translate.instant('on') + " " + $translate.instant(event.day) + " " +
            $translate.instant('at') + " " + event.time;
        } else {
          event.formattedRecurringType = $translate.instant('Every two weeks');
          event.formattedDate = $translate.instant('Every two weeks') + " " +
            $translate.instant('on') + " " + $translate.instant(event.day) + " " +
            $translate.instant('at') + " " + event.time;
        }
      } else {
        //One-off event
        event.formattedDate = moment(startDate).format('Do MMMM YY') + ', ' +
          moment(startDate).format('HH:mm') +  ' - ' +
          moment(endDate).format('HH:mm');
      }

      _.each(event.dates, function (eventDateObj) {
        var date = moment(eventDateObj.startTime).format('Do MMMM YY');
        applicationCheckInDates.push(date);
      });

      $scope.event = event;
      $scope.event.capacity = 0;

      cdEventsService.searchSessions({eventId: eventId}, function (sessions) {
        $scope.event.sessions = sessions;
        _.each($scope.event.sessions, function (session, index) {
          if(!$scope.sessionStats[session.id]) $scope.sessionStats[session.id] = {};
          $scope.sessionStats[session.id].capacity = 0;
          $scope.sessionStats[session.id].attending = 0;
          $scope.sessionStats[session.id].waitlist = 0;
          _.each(session.tickets, function (ticket) {
            if(ticket.type !== 'other') {
              $scope.event.capacity += ticket.quantity;
              $scope.sessionStats[session.id].capacity += ticket.quantity;
            }
          });
          $scope.$watch('event.sessions['+index+'].isOpen', function (isOpen){
            if (isOpen) loadAttendeeList(session);
          });
        });

        $scope.manageDojoEventApplicationsPageTitle = $scope.event.name;

        async.each($scope.event.sessions, function (session, cb) {
          cdEventsService.searchApplications({sessionId: session.id, deleted: false}, function (applications) {
            _.each(applications, function (application) {
              if(application.status === 'approved') {
                $scope.eventStats.totalAttending++;
              } else {
                $scope.eventStats.totalWaitlist++;
              }
            });
            return cb();
          }, function (err) {
            if(err) console.error(err);
          });
        }, function (err) {
          if(err) console.error(err);
          $scope.loadPage($scope.event.sessions[0].id);
          $scope.event.sessions[0].isOpen = true;
        });

      });
    });

    var loadAttendeeList = function(session) {
      $scope.loadPage(session.id);
    };

    $scope.filterApplications = function (sessionId) {
      $scope.loadPage(sessionId);
    };

    $scope.pageChanged = function (sessionId) {
      $scope.loadPage(sessionId, false);
    }

    $scope.loadPage = function (sessionId, resetFlag) {
      usSpinnerService.spin('session-applications-spinner');
      $scope.approved = {};
      $scope.checkedIn = {};
      $scope.sort = $scope.sort ? $scope.sort: {created: 1};

      var query = _.omit({
        sessionId: sessionId,
        deleted: false
      }, function (value) {
        return value === '' || _.isNull(value) || _.isUndefined(value)
      });

      if(!_.isEmpty($scope.filter)) {
        _.extend(query, $scope.filter);
      }

      var loadPageData = tableUtils.loadPage(resetFlag, $scope.pagination.itemsPerPage, $scope.pagination.pageNo, query);
      $scope.pagination.pageNo = loadPageData.pageNo;
      $scope.applications = [];

      cdEventsService.searchApplications(_.extend({sessionId: sessionId, deleted: false}, $scope.filter), function (result) {
        $scope.pagination.totalItems = result.length;
        $scope.sessionStats[sessionId].attending = 0;
        $scope.sessionStats[sessionId].waitlist = 0;

        _.each(result, function (application) {
          if (application.status === 'approved') {
            $scope.sessionStats[sessionId].attending++;
          } else {
            $scope.sessionStats[sessionId].waitlist++;
          }
        });
      }, function (err) {
        if(err) {
          console.error(err);
          alertService.showError($translate.instant('Error loading applications'));
        }
      });

      var meta = {
        limit$: $scope.pagination.itemsPerPage,
        skip$: loadPageData.skip,
        sort$: $scope.sort
      };

      _.extend(query, meta);

      cdEventsService.searchApplications(query, function (result) {
        async.each(result, function (application, cb) {
          if (application.status === 'approved') {
            $scope.approved[application.id] = true;
          } else {
            $scope.approved[application.id] = false;
          }

          if($scope.event.type === 'one-off') {
            if(application.attendance && application.attendance.length > 0) {
              $scope.checkedIn[application.id] = true;
            } else {
              $scope.checkedIn[application.id] = false;
            }
          }

          application.age = moment().diff(application.dateOfBirth, 'years');
          application.dateApplied = moment(application.created).format('Do MMMM YY');

          application.applicationDates = [];
          _.each(applicationCheckInDates, function (checkInDate) {
            application.applicationDates.push({applicationId: application.id, date: checkInDate});
          });

          application.attendanceModel = [];
          _.each(application.attendance, function (attendanceDate) {
            var checkInDate = moment(attendanceDate).format('Do MMMM YY');
            application.attendanceModel.push({applicationId: application.id, date: checkInDate})
          });

          cdUsersService.load(application.userId, function (response) {
            application.user = response;
            application.parents = [];
            cdUsersService.userProfileData({userId: application.user.id}, function (response) {
              async.each(response.parents, function (parentUserId, cb) {
                cdUsersService.load(parentUserId, function (response) {
                  application.parents.push(response);
                  cb();
                });
              }, cb);
            });
          });

        }, function (err) {
          usSpinnerService.stop('session-applications-spinner');
          $scope.applications = result;
        });
      }, function (err) {
        if(err) {
          console.error(err);
          alertService.showError($translate.instant('Error loading applications'));
        }
      });
    }

    $scope.updateApplication = function (application, updateType) {
      var resetFlag = false;
      var successMessage;
      switch(updateType) {
        case 'status':
          updateStatus();
          break;
        case 'attendance':
          updateAttendance();
          break;
        case 'deleted':
          resetFlag = true;
          updateDeleted();
          break;
      }

      function updateStatus() {
        if (!$scope.userIsApproved(application)) {
          //Approve user
          application.status = 'approved';
          application.updateAction = 'approve';
          $scope.approved[application.id] = true;
          $scope.sessionStats[application.sessionId].attending++;
          $scope.eventStats.totalAttending++;
          $scope.sessionStats[application.sessionId].waitlist--;
          $scope.eventStats.totalWaitlist--;
          successMessage = application.name + ' ' + $translate.instant('has been successfully approved');
        } else {
          //Disapprove user
          application.status = 'pending';
          application.updateAction = 'disapprove';
          $scope.approved[application.id] = false;
          $scope.sessionStats[application.sessionId].attending--;
          $scope.eventStats.totalAttending--;
          $scope.sessionStats[application.sessionId].waitlist++;
          $scope.eventStats.totalWaitlist++;
        }
      }

      function updateAttendance() {
        var date = moment.utc(application.applicationDates[0].date, 'Do MMMM YY').toISOString();
        application.updateAction = 'checkin';
        if(!$scope.userIsCheckedIn(application)) {
          if(!application.attendance) application.attendance = [];
          application.attendance.push(date);
          $scope.checkedIn[application.id] = true;
          successMessage = application.name + ' ' + $translate.instant('has been checked in');
        } else {
          application.attendance = _.without(application.attendance, date);
          $scope.checkedIn[application.id] = false;
        }
      }

      function updateDeleted() {
        application.updateAction = 'delete';
        application.deleted = true;
      }

      application = _.omit(application, ['user', 'age', 'parents', 'dateApplied', 'applicationDates', 'attendanceModel']);
      application.emailSubject = {
        'request':  $translate.instant('Your ticket request for'),
        'received': $translate.instant('has been received'),
        'approved': $translate.instant('has been approved')
      };
      application.dojoId = dojoId;
      cdEventsService.bulkApplyApplications([application], function (applications) {
        if(_.isEmpty(applications)) return;
        if (applications[0].status === 'approved' || applications[0].attended) {
          AlertBanner.publish({
            type: 'info',
            message: successMessage,
            timeCollapse: 5000
          });
        } else if (applications.ok === false){
          alertService.showError($translate.instant('Error updating application') + '<br>' + applications.why);
        }
        if(resetFlag) $scope.loadPage(applications[0].sessionId);
      }, function (err) {
        if(err) alertService.showError($translate.instant('Error updating application') + '<br>' + JSON.stringify(err));
      });
    }

    $scope.userIsApproved = function (application) {
      var isApproved = $scope.approved[application.id];
      if (isApproved) return true;
      return false;
    }

    $scope.userIsCheckedIn = function (application) {
      var isCheckedIn = $scope.checkedIn[application.id];
      if (isCheckedIn) return true;
      return false;
    }

    $scope.createNewApplicant = function () {
      if ($scope.newApplicantClicked === true) return $scope.newApplicantClicked = false;
      return $scope.newApplicantClicked = true;
    }

    $scope.cancelNewApplicant = function () {
      $scope.newApplicantClicked = false;
    }

    $scope.showNewApplicantForm = function (session) {
      async.waterfall([
        retrieveDojoUsers,
        showNewApplicantModal
      ], function (err) {
        if(err) return console.error(err);
      });

      function retrieveDojoUsers(done) {
        cdDojoService.loadDojoUsers({dojoId: dojoId}, function (dojoUsers) {
          var eventUserSelection = {};
          eventUserSelection[dojoId] = [];
          _.each(dojoUsers, function (dojoUser) {
            eventUserSelection[dojoId].push({userId: dojoUser.id, title: dojoUser.name});
          });
          return done(null, eventUserSelection);
        }, function (err) {
          if(err) {
            console.error(err);
            return done(err);
          }
        });
      }

      function showNewApplicantModal(eventUserSelection, done) {
        var newApplicantModalInstance = $modal.open({
          animation: true,
          templateUrl: '/dojos/template/events/session-details',
          controller: 'session-modal-controller',
          size: 'lg',
          resolve: {
            dojoId: function () {
              return dojoId;
            },
            session: function () {
              return session;
            },
            event: function () {
              return $scope.event;
            },
            applyForModel: function () {
                $scope.applyForModel = {};
                _.each(session.tickets, function (ticket) {
                  var applyForData = angular.copy(eventUserSelection[$scope.event.dojoId]);
                  _.each(applyForData, function (applyObj) {
                    applyObj.ticketId = ticket.id;
                    applyObj.ticketName = ticket.name;
                    applyObj.ticketType = ticket.type;
                  });
                  $scope.applyForModel[ticket.id] = applyForData;
                });
                return $scope.applyForModel;
              },
            currentUser: function () {
              return currentUser;
            },
            referer: function () {
              return 'manage-event-applications';
            }
          }
        });

        newApplicantModalInstance.result.then(function (result) {
          if(result.ok === false) return alertService.showError($translate.instant(result.why));
          alertService.showAlert($translate.instant('New applicants successfully added.'));
          $scope.loadPage(session.id, true);
        }, null);
        return done();
      }
    };

    $scope.cancelSession = function (session) {
      session.status = 'cancelled';
      session.emailSubject = $translate.instant('has been cancelled');
      cdEventsService.cancelSession(session, function (response) {
        $state.go('my-dojos.manage-dojo-events', {dojoId: dojoId});
        alertService.showAlert($translate.instant('Session successfully cancelled.'));
      }, function (err) {
        if(err) console.error(err);
      });
    };

  }

  angular.module('cpZenPlatform')
    .controller('manage-event-applications-controller', ['$scope', '$stateParams', '$state', '$translate', '$modal', 'alertService', 'cdEventsService',
      'tableUtils', 'cdDojoService', 'cdUsersService', 'AlertBanner', 'utilsService', 'usSpinnerService', 'currentUser', manageEventApplicationsControllerCtrl]);

})();
