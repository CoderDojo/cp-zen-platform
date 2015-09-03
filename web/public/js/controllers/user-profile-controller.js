'use strict';

function cdUserProfileCtrl($scope, $rootScope, $state, auth, cdUsersService, cdDojoService, alertService,
  $translate, profile, utils, loggedInUser, usersDojos, $stateParams, hiddenFields,
  Upload, cdBadgesService, utilsService, initUserTypes, cdProgrammingLanguagesService,
  agreement ,championsForUser, parentsForUser, badgeCategories, dojoAdminsForUser, $window, usSpinnerService, atomicNotifyService, $timeout) {

  if(profile.err || loggedInUser.err || usersDojos.err || hiddenFields.err || agreement.err){
    alertService.showError($translate.instant('error.general'));
    return;
  }

  $scope.currentStateName = $state.current.name;

  if ($stateParams.showBannerMessage) {
    atomicNotifyService.info($translate.instant('Please complete your profile before continuing.'), 5000);
  }

  $scope.$on('$destroy', function(){
    atomicNotifyService.dismissAll();
  });

  $scope.editMode = false;
  var profileUserId = $state.params.userId;
  var loggedInUserId = loggedInUser.data && loggedInUser.data.id;
  var getHighestUserType = utilsService.getHighestUserType;

  if($state.current.name === 'edit-user-profile') {
    if(profileUserId === loggedInUserId || loggedInUserIsParent()) {
      $scope.editMode = true;
      $scope.inviteNinjaPopover = {
        title: $translate.instant('Invite Ninja over 13'),
        templateUrl: '/profiles/template/invite-ninja-over-13',
        placement: 'top',
        placeholder: $translate.instant('Enter Ninja Email Address'),
        show: false
      };
    } else {
      //No permission
      $state.go('error-404-no-headers');
    }
  }

  if($state.current.name === 'add-child') {
    if($state.params.parentId === loggedInUserId) {
      $scope.editMode = true;
    } else {
      //No permission
      $state.go('error-404-no-headers');
    }
  }

  $scope.upload = function (files) {
    if($scope.profile.id) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          Upload.upload({
            url: '/api/1.0/profiles/change-avatar',
            headers : {
              'Content-Type': 'multipart/form-data'
            },
            file: file,
            fields: {profileId: profile.data.id, fileName: file.name, fileType: file.type}
          }).progress(function (evt) {
          }).success(function (data, status, headers, config) {
            cdUsersService.getAvatar($scope.profile.id, function(response){
              $scope.profile.avatar = 'data:' + response.imageInfo.type + ';base64,' + response.imageData;
            })
          }).error(function (data, status, headers, config) {
            alertService.showError($translate.instant('There was an error uploading your profile picture.'));
          });
        }
      }
    }
  };

  $scope.hiddenFields =  getHiddenFields(hiddenFields.data, profile.data.userTypes);
  $scope.badgeInfo = {};
  $scope.badgeInfoIsCollapsed = {};
  var lastClicked = {};

  function getHiddenFields(hiddenFields, userTypes){
    var retHiddenFields = [];

    _.each(userTypes, function(userType){
      var filteredFields = _.filter(hiddenFields, function(hiddenField){
        return _.contains(hiddenField.allowedUserTypes, userType);
      });

      retHiddenFields = _.union(retHiddenFields, filteredFields);
    });

    return retHiddenFields;
  }

  $scope.hasAccess = utils.hasAccess;

  if(profile.data.dob) profile.data.formattedDateOfBirth = moment(profile.data.dob).format('DD MMMM YYYY');
  $scope.highestUserType = getHighestUserType(profile.data.userTypes);
  var userTypeFound = _.find(initUserTypes.data, function (initUserType) {
    return initUserType.name === $scope.highestUserType;
  });

  if(userTypeFound) {
    switch(userTypeFound.title) {
      case 'Ninja Under 13':
        userTypeFound.title = $translate.instant('Ninja');
        break;
      case 'Ninja Over 13':
        userTypeFound.title = $translate.instant('Ninja');
        break;
    }
    profile.data.userTypeTitle = userTypeFound.title;
  }

  $scope.isPrivate = profile.data.private;

  //Load user's badges
  $scope.categories = [];
  $scope.badges = {};
  var profileBadges = angular.copy(profile.data.badges);

  _.each(badgeCategories.data.categories, function (mainCategory) {
    _.each(profileBadges, function (badge) {
      if(badge.status === 'accepted') {
        var indexFound;
        var mainCategoryFound = _.find(badge.tags, function (tag, index) {
          indexFound = index;
          return tag.value === mainCategory;
        });
        badge.formattedDateAccepted = moment(badge.dateAccepted).format('Do MMMM YYYY');
        if(mainCategoryFound) {
          badge.tags.splice(indexFound, 1);
          if(!$scope.badges[mainCategoryFound.value]) $scope.badges[mainCategoryFound.value] = {};
          _.each(badge.tags, function (tag) {
            if(!$scope.badges[mainCategoryFound.value][tag.value]) $scope.badges[mainCategoryFound.value][tag.value] = [];
            $scope.badges[mainCategoryFound.value][tag.value].push(badge);
          });
          var categoryAdded = _.find($scope.categories, function (category) {
            return category === mainCategoryFound.value;
          });
          if(!categoryAdded) $scope.categories.push(mainCategoryFound.value);
        }
      }
    });
  });

  $scope.profile = profile.data;

  cdUsersService.getAvatar($scope.profile.id, function(response){
    if(!_.isEmpty(response)) {
      $scope.profile.avatar = 'data:' + response.imageInfo.type + ';base64,' + response.imageData;
    }
  });

  $scope.capitalizeFirstLetter = utilsService.capitalizeFirstLetter;

  $scope.showBadgeInfo = function (tag, badge) {
    if(lastClicked[tag] !== badge.id && $scope.badgeInfoIsCollapsed[tag]) {
      $scope.badgeInfo[tag] = badge;
    } else {
      $scope.badgeInfo[tag] = badge;
      $scope.badgeInfoIsCollapsed[tag] = !$scope.badgeInfoIsCollapsed[tag];
    }
    lastClicked[tag] = badge.id;
  }

  $scope.loggedInUser = loggedInUser.data;

  $scope.loadProgrammmingLanguagesTags = function(query) {
    return cdProgrammingLanguagesService.get();
  };

  $scope.inviteParent = function(data){
    var win = function(response){
      if(response.ok === false) return alertService.showError($translate.instant(response.why));
      return alertService.showAlert($translate.instant('Invitation was sent successfully.'));
    };

    var fail = function(){
      alertService.showError($translate.instant('An error has occurred while sending invitation') );
    };

    data.emailSubject = $translate.instant('Invitation to become a Parent/Guardian');
    cdUsersService.inviteParent(data, win, fail);
  };

  if($stateParams.userType){
    $scope.profile = {
      ownProfileFlag: true,
      userTypes: [$stateParams.userType]
    };
  }

  if(!_.isEmpty($scope.profile)){
    $scope.profile.programmingLanguages = utils.toTags($scope.profile.programmingLanguages);
    $scope.profile.languagesSpoken = utils.toTags($scope.profile.languagesSpoken);
    $scope.profile.private =  $scope.profile.private ? "true" : "false";

    $scope.profile.widget = {};
    $scope.profile.widget.programmingLanguages = utils.frTags($scope.profile.programmingLanguages);
    $scope.profile.widget.languagesSpoken = utils.frTags($scope.profile.languagesSpoken);
  }


  if(loggedInUser.data && $stateParams.userId){

    cdDojoService.dojosForUser($stateParams.userId, function (response) {
      $scope.dojos = response;
      if(_.isEmpty($scope.dojos)) {
        //This user has no Dojos.
        //Use init user type to setup profile.

        $scope.userType = loggedInUser.data.initUserType;
      } else {
        //Search usersdojos for highest user type
        findHighestUserType();
      }
    }, function (err) {
      alertService.showError( $translate.instant('Error loading Dojos') + ' ' + err);
    });
  }


  function findHighestUserType() {
    var highestTypeFound = false;

    function checkLinks(userType) {
      for(var i = 0; i < usersDojos.length; i++) {
        var userDojoLink = usersDojos[i];
        var userTypes = userDojoLink.userTypes;
        if(_.contains(userTypes, userType)) {
          highestTypeFound = true;
          return userType;
        }
      }
    }

    //If no champion found, search for next user type
    var searchForUserTypes = ['champion', 'mentor', 'parent-guardian', 'attendee-o13', 'attendee-u13'];

    _.each(searchForUserTypes, function (searchForUserType) {
      if(!highestTypeFound){
        $scope.userType = checkLinks(searchForUserType);
      }
    });

  }

  $scope.parentProfile = _.contains(profile.data.userTypes, 'parent-guardian');

  $scope.save = function(profile){
    _.each(['http://', 'https://', 'www.'], function(prefix){
      _.each(['linkedin', 'twitter'], function(field){
        // if prefixed, remove prefix
        if (profile[field]){
          var str = profile[field].toString();
          if (str.substring(0, prefix.length).indexOf(prefix) > -1) profile[field] = str.substring(prefix.length);
        }
      });
    });

    var profileCopy = angular.copy(profile);

    profileCopy = _.omit(profileCopy, ['countryName', 'countryNumber', 'ownProfileFlag', 'widget', 'dojos',
      'passwordConfirm', 'myChild', 'resolvedChildren', 'resolvedParents', 'isTicketingAdmin',
      'formattedDateOfBirth', 'userTypeTitle', 'requestingUserIsDojoAdmin']);

    if($stateParams.userType === 'attendee-o13' || $stateParams.userType === 'attendee-u13' || profile.myChild){
      saveYouthViaParent(profileCopy);
    } else {
      saveDirect(profileCopy);
    }
  };

  function saveYouthViaParent(profile){
    profile = _.omit(profile, ['dojos']);
    profile.programmingLanguages = profile.programmingLanguages && utils.frTags(profile.programmingLanguages);
    profile.languagesSpoken = profile.languagesSpoken && utils.frTags(profile.languagesSpoken);
    
    cdUsersService.saveYouthProfile(profile, function (response) {
      alertService.showAlert($translate.instant('Profile has been saved successfully'));
      $state.go('user-profile', {userId: response.userId});
    }, function(){
      alertService.showError($translate.instant('An error has occurred while saving profile'));
    });
  }

  function saveDirect(profile){
    profile = _.omit(profile, ['userTypes', 'dojos']);

    profile.programmingLanguages = profile.programmingLanguages && utils.frTags(profile.programmingLanguages);
    profile.languagesSpoken = profile.languagesSpoken && utils.frTags(profile.languagesSpoken);

    function win(profile){
      if(profile.ok === false) {
        alertService.showError($translate.instant(profile.why));
        $state.go('user-profile', {userId: $stateParams.userId});
      } else {
        $scope.profile = profile;
        $scope.profile.private =  $scope.profile.private ? "true" : "false";
        alertService.showAlert($translate.instant('Profile has been saved successfully'));
        auth.instance(function(data){
          if( data.user ) $rootScope.$broadcast('user-updated', data.user);
          $state.go('user-profile', {userId: $stateParams.userId});
        });
      }      
    }

    function fail(){
      alertService.showError($translate.instant('An error has occurred while saving profile'));
    }

    cdUsersService.saveProfile(profile, win, fail);
  }

  $scope.toggleEdit = function(field){
    $scope[field] = $scope[field] ? false : true;
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.picker = {opened: false};

  $scope.open = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.picker.opened = true;
  };

  cdDojoService.listCountries(function(countries) {
    $scope.countries = countries;
  });

  var initialDate = new Date();
  initialDate.setFullYear(initialDate.getFullYear()-18);
  $scope.dobDateOptions = {
    formatYear: 'yyyy',
    startingDay: 1,
    'datepicker-mode': "'year'",
    initDate: initialDate
  };

  $scope.setCountry = function(profile, country) {
    profile.countryName = country.countryName;
    profile.countryNumber = country.countryNumber;
    profile.continent = country.continent;
    profile.alpha2 = country.alpha2;
    profile.alpha3 = country.alpha3;
  };

  $scope.getPlaces = function (countryCode, $select) {
    return utilsService.getPlaces(countryCode, $select).then(function (data) {
      $scope.places = data;
    }, function (err) {
      $scope.places = [];
      console.error(err);
    });
  }

  $scope.setPlace = function(profile, place) {
    profile.placeName = place.name;
    profile.placeGeonameId = place.geonameId;
    profile.county = {};
    profile.state = {};
    profile.city = {};
    for (var adminidx=1; adminidx<=4; adminidx++) {
      profile['admin'+ adminidx + 'Code'] = place['admin'+ adminidx + 'Code'];
      profile['admin'+ adminidx + 'Name'] = place['admin'+ adminidx + 'Name'];
    }
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.fullDateFormat = $scope.formats[0];
  $scope.today = new Date();

  $scope.validatePassword = function (password, email) {
    var validationResult = utilsService.validatePassword(password, email);
    if(!validationResult.valid) $scope.invalidPasswordMessage = $translate.instant(validationResult.msg);
    return validationResult.valid;
  }

  $scope.matchesPassword = function(password, passwordConfirm) {
    if(passwordConfirm !== password) {
      $scope.invalidConfirmPasswordMessage = $translate.instant('Passwords do not match');
      return false;
    }
    return true;
  }

  $scope.exportBadges = function () {
    cdBadgesService.exportBadges(function (response) {
      //TODO
    });
  }

  $scope.editProfile = function () {
    $state.go('edit-user-profile', {userId: $stateParams.userId});
  }

  $scope.viewProfile = function () {
    $state.go('user-profile', {userId: $stateParams.userId});
  }

  $scope.viewDojo = function(dojo) {
    var urlSlugArray = dojo.urlSlug.split('/');
    var country = urlSlugArray[0].toString();
    urlSlugArray.splice(0, 1);
    var path = urlSlugArray.join('/');
    $state.go('dojo-detail',{country:country, path:path});
  }

  $scope.profileVisible = function () {
    if($state.current.name === 'add-child') return true;
    var highestUserType = getHighestUserType(profile.data.userTypes);
    switch (highestUserType) {
      case 'champion':
        return true; //Always public
      case 'mentor':
        if($scope.profile.ownProfileFlag) return true;
        if(loggedInUserIsChampion()) return true;
        if(loggedInUserIsDojoAdmin()) return true;
        return !$scope.isPrivate;
      case 'parent-guardian':
        if($scope.profile.ownProfileFlag) return true;
        if(loggedInUserIsChampion()) return true;
        if(loggedInUserIsDojoAdmin()) return true;
        return false; //Always private
      case 'attendee-o13':
        if($scope.profile.ownProfileFlag) return true;
        if(loggedInUserIsChampion()) return true;
        if(loggedInUserIsDojoAdmin()) return true;
        if(loggedInUserIsParent()) return true;
        return !$scope.isPrivate;
      case 'attendee-u13':
        if($scope.profile.ownProfileFlag) return true;
        if(loggedInUserIsChampion()) return true;
        if(loggedInUserIsDojoAdmin()) return true;
        if(loggedInUserIsParent()) return true;
        return false; //Always private
      default:
        return false;
    }
  }

  function loggedInUserIsParent() {
    if(!loggedInUser.data) return false;
    return _.find(parentsForUser.data, function (parentForUser) {
      return parentForUser.id === loggedInUser.data.id;
    });
  }

  function loggedInUserIsChampion() {
    if(!loggedInUser.data) return false;
    return _.find(championsForUser.data, function (championForUser) {
      return championForUser.id === loggedInUser.data.id;
    });
  }

  function loggedInUserIsDojoAdmin() {
    if(!loggedInUser.data) return false;
    return _.find(dojoAdminsForUser.data, function (dojoAdminForUser) {
      return dojoAdminForUser.id === loggedInUser.data.id;
    });
  }

  $scope.hideProfileBlock = function (block) {
    if($scope.highestUserType === 'attendee-o13' || $scope.highestUserType === 'mentor') {
      if(loggedInUserIsChampion()) return false;
      if(loggedInUserIsDojoAdmin()) return false;
      if(loggedInUserIsParent()) return false;
      if($scope.profile.ownProfileFlag) return false;
      if(block && $scope.profile.optionalHiddenFields) {
        if(!$scope.profile.optionalHiddenFields[block]) return false;
        return true;
      }
      return true;
    }
    return false;
  }

  $scope.hideGeneralInfoBlock = function () {
    if(loggedInUserIsChampion()) return false;
    if(loggedInUserIsDojoAdmin()) return false;
    if(loggedInUserIsParent()) return false;
    if($scope.profile.ownProfileFlag) return false;
    return true;
  }

  $scope.canMakeProfilePrivate = function () {
    if($scope.highestUserType === 'attendee-o13' || $scope.highestUserType === 'mentor') return true;
    return false;
  }

  $scope.canUpdateHiddenField = function (hiddenField) {
    return _.contains(hiddenField.allowedUserTypes, $scope.highestUserType);
  }

  $scope.hideChampionProfileBlock = function (block) {
    if($scope.profile.ownProfileFlag) return false;
    if($scope.profile.optionalHiddenFields && $scope.profile.optionalHiddenFields[block]) return true;
    return false;
  }

  $scope.inviteNinja = function (ninjaEmail) {
    usSpinnerService.spin('user-profile-spinner');
    var ninjaData = {
      ninjaEmail: ninjaEmail,
      emailSubject: $translate.instant('Approve Parent Request')
    };
    cdUsersService.inviteNinja(ninjaData, function (response) {
      usSpinnerService.stop('user-profile-spinner');
      $scope.inviteNinjaPopover.show = false;
      $scope.inviteNinjaPopover.email = '';
      if(response.ok === false) return alertService.showError($translate.instant(response.why));
      return alertService.showAlert($translate.instant('Invite Sent'));
    }, function (err) {
      usSpinnerService.stop('user-profile-spinner');
      alertService.showError($translate.instant('Error inviting Ninja'));
      $scope.inviteNinjaPopover.show = false;
      $scope.inviteNinjaPopover.email = '';
    });
  }

  $scope.toggleInviteNinjaPopover = function () {
    $scope.inviteNinjaPopover.show = !$scope.inviteNinjaPopover.show;
  }

}

angular.module('cpZenPlatform')
  .controller('user-profile-controller', ['$scope', '$rootScope', '$state', 'auth', 'cdUsersService', 'cdDojoService', 'alertService',
    '$translate', 'profile', 'utilsService', 'loggedInUser', 'usersDojos', '$stateParams',
    'hiddenFields', 'Upload', 'cdBadgesService', 'utilsService', 'initUserTypes', 'cdProgrammingLanguagesService',
    'agreement','championsForUser', 'parentsForUser', 'badgeCategories', 'dojoAdminsForUser', '$window', 'usSpinnerService', 'atomicNotifyService', '$timeout', cdUserProfileCtrl]);

