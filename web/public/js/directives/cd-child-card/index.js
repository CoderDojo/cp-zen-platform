(function () {
  'use strict';

  angular.module('cpZenPlatform').component('cdChildCard', {
    bindings: {
      parentProfileData: '<'
    },
    templateUrl: '/directives/tpl/cd-child-card',
    controller: ['cdDojoService', 'cdUsersService', 'userUtils', '$stateParams', '$uibModal', '$translate', function (cdDojoService, cdUsersService, userUtils, $stateParams, $uibModal, $translate) {
      var ctrl = this;
      var MAX_RECENT_BADGES = 4;
      var originalDojoListings;
      var originalDojosNotAMemberOf;
      ctrl.noop = angular.noop;
      ctrl.manageDojos = false;
      ctrl.savingDojos = false;

      ctrl.toggleManageDojos = function () {
        if (ctrl.manageDojos) {
          ctrl.child.dojoListings = originalDojoListings;
          originalDojoListings = undefined;
          ctrl.child.dojosNotMemberOf = originalDojosNotAMemberOf;
          originalDojosNotAMemberOf = undefined;
          ctrl.manageDojos = false;
        } else {
          originalDojoListings = ctrl.child.dojoListings.slice(0);
          originalDojosNotAMemberOf = ctrl.child.dojosNotMemberOf.slice(0);
          ctrl.manageDojos = true;
        }
      };

      ctrl.saveDojos = function () {
        ctrl.savingDojos = true;
        var dojosToAdd = _.difference(originalDojosNotAMemberOf, ctrl.child.dojosNotMemberOf);
        var dojosToRemove = _.difference(originalDojoListings, ctrl.child.dojoListings);
        var totalOps = dojosToAdd.length + dojosToRemove.length;
        var age = userUtils.getAge(ctrl.child.dob);
        var userType = 'attendee-';
        if (age < 13) {
          userType += 'u13';
        } else {
          userType += 'o13';
        }

        function addOrRemoveDojoSuccess() {
          totalOps--;
          if (totalOps <= 0) {
            originalDojoListings = undefined;
            originalDojosNotAMemberOf = undefined;
            ctrl.manageDojos = false;
            ctrl.savingDojos = false;
          }
        }

        dojosToAdd.forEach(function (dojo) {
          cdDojoService.saveUsersDojos({
            dojoId: dojo.id,
            userId: ctrl.child.userId,
            owner: 0,
            userTypes: [userType]
          }, addOrRemoveDojoSuccess)
        });
        dojosToRemove.forEach(function (dojo) {
          cdDojoService.removeUsersDojosLink({
            dojoId: dojo.id,
            userId: ctrl.child.userId,
            emailSubject: 'A user has left your Dojo'
          }, addOrRemoveDojoSuccess)
        });
      };

      ctrl.addToDojo = function (e, dojoToAdd) {
        e.preventDefault();
        var addedDojo = _.remove(ctrl.child.dojosNotMemberOf, function (dojo) {
          return dojo.id === dojoToAdd.id;
        });
        ctrl.child.dojoListings = _.concat(ctrl.child.dojoListings, addedDojo);
        ctrl.sortDojos();
      };

      ctrl.removeFromDojo = function(e, dojoToRemove) {
        e.preventDefault();
        var removedDojo = _.remove(ctrl.child.dojoListings, function (dojo) {
          return dojo.id === dojoToRemove.id;
        });
        ctrl.child.dojosNotMemberOf = _.concat(ctrl.child.dojosNotMemberOf, removedDojo);
        ctrl.sortDojos();
      }

      ctrl.sortDojos = function () {
        ctrl.child.dojosNotMemberOf = _.sortBy(ctrl.child.dojosNotMemberOf, ['caption']);
        ctrl.child.dojoListings = _.sortBy(ctrl.child.dojoListings, ['caption']);
      };

      ctrl.prepareDojoListings = function () {
        var child = ctrl.child;
        child.dojoIds = [];
        child.dojoListings = child.dojos.map(function (dojo) {
          if (child.dojoIds.indexOf(dojo.id) === -1) {
            child.dojoIds.push(dojo.id);
          }
          var pictureGridItem = {
            id: dojo.id,
            href: 'dojo/' + dojo.urlSlug,
            picture: '/img/avatars/dojo-default-logo.png',
            caption: dojo.name
          };
          cdDojoService.getAvatar(dojo.id)
            .then(function (avatarUrl) {
              pictureGridItem.picture = avatarUrl;
            });
          return pictureGridItem;
        });
        child.dojosNotMemberOf = [];
        child.dojosNotMemberOf = ctrl.parentProfileData.dojos.filter(function (dojo) {
          return child.dojoIds.indexOf(dojo.id) === -1;
        }).map(function (dojo) {
          var pictureGridItem = {
            id: dojo.id,
            href: 'dojo/' + dojo.urlSlug,
            picture: '/img/avatars/dojo-default-logo.png',
            caption: dojo.name
          };
          cdDojoService.getAvatar(dojo.id)
            .then(function (avatarUrl) {
              pictureGridItem.picture = avatarUrl;
            });
          return pictureGridItem;
        });
        ctrl.sortDojos();
      };

      ctrl.prepareBadgeListings = function () {
        var child = ctrl.child;
        if (child.badges) {
          child.acceptedBadges = child.badges.filter(function (badge) {
            return badge.status === 'accepted';
          });
        } else {
          child.acceptedBadges = [];
        }
        child.recentBadges = _.sortBy(child.acceptedBadges, ['dateAccepted'])
          .slice(0, MAX_RECENT_BADGES)
          .map(function (badge) {
            return {
              id: badge.id,
              picture: badge.imageUrl,
              caption: badge.name,
              data: badge
            };
          });
      }

      ctrl.showBadgeModal = function (e, item) {
        var badge = item.data;
        var badgeModal = $uibModal.open({
          controller: function () {
            this.badge = badge;
            this.close = badgeModal.close;
          },
          bindToController: true,
          controllerAs: '$ctrl',
          template: '<div><cd-badge-cert badge="$ctrl.badge"></cd-badge-cert><div class="modal-footer"><button ng-click="$ctrl.close()" class="btn btn-default pull-right">' + $translate.instant('Close') + '</button></div>',
          size: 'lg'
        });
      };

      ctrl.$onInit = function () {
        cdUsersService.userProfileDataPromise({
          userId: $stateParams.id
        })
          .then(function (child) {
            ctrl.child = child;
            ctrl.prepareDojoListings();
            ctrl.prepareBadgeListings();
          });
      };
    }]
  });
})();
