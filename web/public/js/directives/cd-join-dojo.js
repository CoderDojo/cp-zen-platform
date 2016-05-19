;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdJoinDojo', function () {
        return {  restrict: 'AE',
          templateUrl: '/dojos/template/join-dojo',
          controller: ['$scope', 'cdDojoService', '$translate', 'cdUsersService', 'auth', 'usSpinnerService', '$state', 'alertService', '$location',
           function($scope, cdDojoService, $translate, cdUsersService, auth, usSpinnerService, $state, alertService, $location ) {
            $scope.dojoMember = false;
            $scope.userMemberCheckComplete = false;
            $scope.requestInvite = {};
            var approvalRequired = ['mentor', 'champion'];

            var dojoId = $scope.dojo ? $scope.dojo.id : $scope.event.dojoId;

            $scope.isInviteExisting = function () {
                return $scope.inviteExists;
            };

            $scope.userTypeSelected = function ($item) {
              if(_.contains(approvalRequired, $item)) return $scope.approvalRequired = true;
              return $scope.approvalRequired = false;
            };

            cdUsersService.getInitUserTypes(function (response) {
              var userTypes = _.filter(response, function(type) { return type.name.indexOf('u13') === -1; });
              $scope.initUserTypes = userTypes;
            });

            if(!_.isEmpty($scope.currentUser)){
              if(_.contains(_.map($scope.currentUser.joinRequests, 'dojoId'), dojoId)){
                $scope.inviteExists = true;
              }
              //Check if user is a member of this Dojo
              var query = {dojoId: dojoId, userId: $scope.currentUser.id};
              cdDojoService.getUsersDojos(query, function (response) {
                $scope.dojoMember = !_.isEmpty(response);
                $scope.dojoOwner = false;
                if($scope.dojoMember) $scope.dojoOwner = (response[0].owner === 1) ? true : false;
                $scope.userMemberCheckComplete = true;
              });
            }

            $scope.requestToJoin = function (requestInvite) {
              if(!$scope.requestInvite.userType) {
                $scope.requestInvite.validate="false";
                return
              } else {
                var userType = requestInvite.userType.name;

                auth.get_loggedin_user(function (user) {
                  usSpinnerService.spin('dojo-detail-spinner');
                  var data = {user:user, dojoId: dojoId, userType: userType, emailSubject: $translate.instant('New Request to join your Dojo')};

                  if(_.contains(approvalRequired, userType)) {
                    cdDojoService.requestInvite(data, function (response) {
                      usSpinnerService.stop('dojo-detail-spinner');
                      if(!response.error) {
                        alertService.showAlert($translate.instant('Join Request Sent'));
                        $scope.inviteExists = true;
                      } else {
                        alertService.showError($translate.instant(response.error));
                      }
                    });
                  } else {
                    //Check if user is already a member of this Dojo
                    var query = {userId:user.id, dojoId: dojoId};
                    var userDojo = {};
                    cdDojoService.getUsersDojos(query, function (response) {
                      if(_.isEmpty(response)) {
                        //Save
                        userDojo.owner = 0;
                        userDojo.userId = user.id;
                        userDojo.dojoId = dojoId;
                        userDojo.userTypes = [userType];
                        cdDojoService.saveUsersDojos(userDojo, function (response) {
                          usSpinnerService.stop('dojo-detail-spinner');
                          $state.go($state.current, {}, {reload: true});
                          alertService.showAlert($translate.instant('Successfully Joined Dojo'));
                        });
                      } else {
                        //Update
                        userDojo = response[0];
                        if(!userDojo.userTypes) userDojo.userTypes = [];
                        userDojo.userTypes.push(userType);
                        cdDojoService.saveUsersDojos(userDojo, function (response) {
                          usSpinnerService.stop('dojo-detail-spinner');
                          $state.go($state.current, {}, {reload: true});
                          alertService.showAlert($translate.instant('Successfully Joined Dojo'));
                        });
                      }
                    });
                  }
                }, function () {
                  //Not logged in
                  $state.go('register-account', {referer: $location.url(), userType: userType});
                });
              }
            };

          }]
        };
    });

}());
