;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdJoinDojo', function () {
        return {  restrict: 'AE',
          templateUrl: '/directives/tpl/dojo/join-dojo',
          controller:
          ['$scope', 'cdDojoService', '$translate', 'cdUsersService', 'auth',
           '$state', 'alertService', '$location', 'atomicNotifyService', 'userUtils', '$q',
           function($scope, cdDojoService, $translate, cdUsersService, auth,
             $state, alertService, $location, atomicNotifyService, userUtils, $q) {
            $scope.dojoMember = false;
            $scope.userMemberCheckComplete = false;
            $scope.requestInvite = $scope.modalData = {};
            $scope.loggedOut = _.isEmpty($scope.currentUser);
            var approvalRequired = ['mentor', 'champion'];
            $scope.ninjaRole = {
              name: 'Attendee',
              userType: {
                name:'attendee-o13'
              },
              image: userUtils.defaultAvatar('attendee-o13'),
              approvalRequired: false,
              text: $translate.instant('Attendees at CoderDojo are young people under 18 who attend and make CoderDojo cool. Often known as Ninjas, CoderDojo attendees come to the Dojo to have fun and bring their awesome ideas to life.'),
              class: 'cd-ninja'
              buttonText: $translate.instant('Join Dojo')
            };
            $scope.parentRole = {
              name: 'Parent/Guardian',
              userType: {
                name: 'parent-guardian'
              },
              image: userUtils.defaultAvatar('parent-guardian'),
              approvalRequired: false,
              text: $translate.instant('Parents/Guardians are super important in the CoderDojo journey as they encourage and inspire CoderDojo Ninjas on a daily basis. Parents should register and join a Dojo so the young people attached to their account can sign up to events and earn badges from their Champions and Mentors.'),
              class: 'cd-parent',
              buttonText: $translate.instant('Join Dojo')
            };
            $scope.roles = [
              {
                name: 'Volunteer',
                userType: {
                  name:  'mentor'
                },
                approvalRequired: true,
                image: userUtils.defaultAvatar('mentor'),
                text: $translate.instant('Volunteers are the driving force behind Dojos around the world. Volunteers do everything from setting up the space, to mentoring during the Dojo, and to ensuring there is cool content for the Ninjas to do at each Dojo! Volunteers should join their Dojo on Zen to get updates on cool content, contribute to the CoderDojo Forums and to help administer the Dojo by awarding badges and setting up events!'),
                class: 'cd-volunteer',
                buttonText: $translate.instant('Send Request')
              },
              {
                name: 'Champion',
                userType: {
                  name:  'champion'
                },
                approvalRequired: true,
                image: userUtils.defaultAvatar('champion'),
                text: $translate.instant('CoderDojo Champions are those who take the lead in organising a Dojo and ensure each session runs smoothly. Champions can be one person or it can be a few people who Co-Champion a Dojo to share the work. Champions should join their Dojo on Zen to set up events, award badges and to contribute to the CoderDojo Forums.'),
                class: 'cd-champion',
                buttonText: $translate.instant('Send Request')
              }];

            if (!$scope.loggedOut) {
              cdUsersService.userProfileDataPromise({userId: $scope.currentUser.id}).then(
                function (profile) {
                  $scope.profile = profile;
                  setJoinData();
                }
              );
            }
            function setJoinData (){
              $scope.ninjaRole.image = userUtils.defaultAvatar($scope.ninjaRole.userType.name, $scope.profile.gender);
              $scope.parentRole.image = userUtils.defaultAvatar($scope.parentRole.userType.name, $scope.profile.gender);
              _.forEach($scope.roles, function(role, index){
                $scope.roles[index].image = userUtils.defaultAvatar(role.userType.name, $scope.profile.gender);
              })
            }

            var dojoId = $scope.dojo ? $scope.dojo.id : $scope.event.dojoId;

            $scope.isInviteExisting = function () {
                return $scope.inviteExists;
            };

            $scope.canLeave = function () {
              return $scope.dojoMember && !$scope.dojoOwner && $scope.userMemberCheckComplete;
            }

            $scope.userTypeSelected = function ($item) {
              if(_.includes(approvalRequired, $item)) return $scope.approvalRequired = true;
              return $scope.approvalRequired = false;
            };

            cdUsersService.getInitUserTypes(function (response) {
              var userTypes = _.filter(response, function(type) { return type.name.indexOf('u13') === -1; });
              $scope.initUserTypes = userTypes;
            });

            if(!$scope.loggedOut){
              if(_.includes(_.map($scope.currentUser.joinRequests, 'dojoId'), dojoId)){
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
              filterPossibleRoles();
            }

            function filterPossibleRoles(){
              var userType = JSON.parse($scope.currentUser.initUserType);
              $scope.isAdult = userType.name === 'parent-guardian' ||
                userType.name === 'mentor' || userType.name === 'champion';
              if ($scope.isAdult) // Legacy userTypes
              {
                $scope.roles.unshift($scope.parentRole);
              } else {
                $scope.roles = [$scope.ninjaRole];
              }
            }


            $scope.requestToJoin = $scope.modalCallback = function (role) {
              return $q(function (resolve, reject) {
                if(!role.userType) {
                  $scope.requestInvite.validate="false";
                  return
                } else {
                  var userType = role.userType.name;

                  auth.get_loggedin_user(function (user) {
                    var data = {user:user, dojoId: dojoId, userType: userType, emailSubject: 'New Request to join your Dojo'};

                    if(_.includes(approvalRequired, userType)) {
                      cdDojoService.requestInvite(data, function (response) {
                        if(!response.error) {
                          resolve($translate.instant('Join Request Sent'));
                          $scope.inviteExists = true;
                        } else {
                          reject($translate.instant(response.error));
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
                            $state.go($state.current, {}, {reload: true});
                            resolve($translate.instant('Successfully Joined Dojo'));
                          });
                        } else {
                          //Update
                          userDojo = response[0];
                          if(!userDojo.userTypes) userDojo.userTypes = [];
                          userDojo.userTypes.push(userType);
                          cdDojoService.saveUsersDojos(userDojo, function (response) {
                            $state.go($state.current, {}, {reload: true});
                            resolve($translate.instant('Successfully Joined Dojo'));
                          });
                        }
                      });
                    }
                  }, function () {
                    //Not logged in
                    $state.go('register-account.user', {referer: $location.url(), userType: userType});
                  });
                }
              });
            };
          }]
        };
    });

}());
