'use strict';

function cdUserProfileCtrl($scope, $state, auth, cdUsersService, cdDojoService, alertService,
  $translate, cdCountriesService, profile, utils, loggedInUser, usersDojos, $stateParams, hiddenFields, 
  Upload, cdBadgesService, utilsService, initUserTypes, cdProgrammingLanguagesService, championsForUser, parentsForUser, badgeCategories) {

  if(profile.err || loggedInUser.err || usersDojos.err || hiddenFields.err){
    alertService.showError('An error has occurred');
    return;
  }

  $scope.editMode = false;
  var profileUserId = $state.params.userId;
  var loggedInUserId = loggedInUser.data && loggedInUser.data.id;

  if($state.current.name === 'edit-user-profile') {
    if(profileUserId === loggedInUserId || loggedInUserIsParent()) { 
      $scope.editMode = true;
    } else {
      //No permission
      $state.go('error-404');
    }
  }

  if($state.current.name === 'add-child') {
    if($state.params.parentId === loggedInUserId) {
      $scope.editMode = true;
    } else {
      //No permission
      $state.go('error-404');
    }
  }

  $scope.upload = function (files) {
    if (files && files.length) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        Upload.upload({
          url: '/api/1.0/profiles/change-avatar',
          headers : {
            'Content-Type': 'multipart/form-data'
          },
          file: file,
          fields: {profileId: profile.data.id}
        }).progress(function (evt) {
        }).success(function (data, status, headers, config) {
          cdUsersService.getAvatar($scope.profile.id, function(response){
            $scope.profile.avatar = 'data:' + response.imageInfo.type + ';base64,' + response.imageData;
          })
        }).error(function (data, status, headers, config) {
          alertService.showError('error status:' + status);
        });
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
    var win = function(){
      alertService.showAlert('Invitation was sent successfully');
    };

    var fail = function(){
      alertService.showError('An error has occurred while sending invitation');
    };

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
    $scope.profile.projects = utils.toTags($scope.profile.projects);
    $scope.profile.private =  $scope.profile.private ? "true" : "false";

    $scope.profile.widget = {};

    $scope.profile.widget.projects = utils.frTags($scope.profile.projects);
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
    var profileCopy = angular.copy(profile);

    profileCopy = _.omit(profileCopy, ['countryName', 'ownProfileFlag', 'widget', 'dojos',
      'passwordConfirm', 'myChild', 'resolvedChildren', 'resolvedParents', 'isTicketingAdmin', 'formattedDateOfBirth', 'userTypeTitle']);

    if($stateParams.userType === 'attendee-o13' || $stateParams.userType === 'attendee-u13' || profile.myChild){
      saveYouthViaParent(profileCopy);
    } else {
      saveDirect(profileCopy);
    }
  };

  function saveYouthViaParent(profile){
    cdUsersService.saveYouthProfile(profile, function(){
      alertService.showAlert($translate.instant('Profile has been saved successfully'));
      $state.go('user-profile', {userId: $stateParams.userId});
    }, function(){
      alertService.showError($translate.instant('An error has occurred while saving profile'));
    });
  }

  function saveDirect(profile){
    profile = _.omit(profile, ['userTypes', 'dojos']);

    profile.programmingLanguages = profile.programmingLanguages && utils.frTags(profile.programmingLanguages);
    profile.languagesSpoken = profile.languagesSpoken && utils.frTags(profile.languagesSpoken);
    profile.projects = profile.projects && utils.frTags(profile.projects);


    function win(profile){
      $scope.profile = profile;
      $scope.profile.private =  $scope.profile.private ? "true" : "false";
      alertService.showAlert($translate.instant('Profile has been saved successfully'));
      $state.go('user-profile', {userId: $stateParams.userId});
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

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  cdCountriesService.listCountries(function(countries) {
    $scope.countries = _.map(countries, function(country) {
      return _.omit(country, 'entity$');
    });
  });

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.setCountry = function(profile, country) {
    profile.countryName = country.countryName;
    profile.countryNumber = country.countryNumber;
    profile.continent = country.continent;
    profile.alpha2 = country.alpha2;
    profile.alpha3 = country.alpha3;
  };

  $scope.getPlaces = function(countryCode, search) {
    if (!countryCode || !search.length || search.length < 3) {
      $scope.places = [];
      return;
    }

    var query = {
      query: {
        filtered: {
          query: {
            multi_match: {
              query: search,
              type: "phrase_prefix",
              fields: ['name', 'asciiname', 'alternatenames', 'admin1Name', 'admin2Name', 'admin3Name', 'admin4Name']
            }
          },
          filter: {
            bool: {
              must: [
                {
                  term: {
                    countryCode: countryCode
                  }
                },
                {
                  term: {
                    featureClass: "P"
                  }
                }
              ]
            }
          }
        }
      },
      from: 0,
      size: 100,
      sort: [
        { asciiname: "asc" }
      ]
    };

    cdCountriesService.listPlaces(query, function(results) {
      $scope.places = _.map(results, function(place) {
        return _.omit(place, 'entity$');
      });
    }, console.error.bind(console));
  };

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
  $scope.format = $scope.formats[0];

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
        return !$scope.isPrivate;
      case 'parent-guardian':
        if($scope.profile.ownProfileFlag) return true;
        if(loggedInUserIsChampion()) return true;
        return false; //Always private
      case 'attendee-o13':
        if($scope.profile.ownProfileFlag) return true;
        if(loggedInUserIsChampion()) return true;
        if(loggedInUserIsParent()) return true;
        return !$scope.isPrivate;
      case 'attendee-u13':
        if($scope.profile.ownProfileFlag) return true;
        if(loggedInUserIsChampion()) return true;
        if(loggedInUserIsParent()) return true;
        return false; //Always private
      default: 
        return false;
    }
  }

  function getHighestUserType(userTypes) {
    var userTypesByPermissionLevel = {
      'champion': 1,
      'mentor': 2,
      'parent-guardian': 3,
      'attendee-o13': 4,
      'attendee-u13': 5
    };

    var userTypeNumbers = [];

    _.each(userTypes, function (userType) {
      userTypeNumbers.push(userTypesByPermissionLevel[userType]);
    });

    var sortedUserTypeNumbers = _.sortBy(userTypeNumbers);
    var highestUserType = utilsService.keyForValue(userTypesByPermissionLevel, sortedUserTypeNumbers[0]);
    return highestUserType;
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

  $scope.hideProfileBlock = function (block) {
    //Only mentors and attendees-o13 can hide certain fields.
    if($scope.highestUserType === 'attendee-o13' || $scope.highestUserType === 'mentor') {
      if(loggedInUserIsChampion()) return false;
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

}

angular.module('cpZenPlatform')
  .controller('user-profile-controller', ['$scope', '$state', 'auth', 'cdUsersService', 'cdDojoService', 'alertService',
    '$translate' , 'cdCountriesService', 'profile', 'utilsService', 'loggedInUser', 'usersDojos', '$stateParams', 
    'hiddenFields', 'Upload', 'cdBadgesService', 'utilsService', 'initUserTypes', 'cdProgrammingLanguagesService', 'championsForUser', 'parentsForUser', 'badgeCategories', cdUserProfileCtrl]);

