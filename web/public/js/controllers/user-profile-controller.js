'use strict';

function cdUserProfileCtrl($scope, $rootScope, $state, $window, auth, cdUsersService, cdDojoService, alertService,
  $translate, profile, utils, loggedInUser, usersDojos, $stateParams, hiddenFields,
  Upload, cdBadgesService, utilsService, initUserTypes, cdProgrammingLanguagesService,
  agreement ,championsForUser, parentsForUser, badgeCategories, dojoAdminsForUser, usSpinnerService, atomicNotifyService, dojoUtils, $timeout, userUtils, $uibModal) {

  $scope.referer = $state.params.referer ? decodeURIComponent($state.params.referer) : $state.params.referer;
  if(profile.err || loggedInUser.err || (usersDojos && usersDojos.err) || (hiddenFields && hiddenFields.err) || (agreement && agreement.err)){
    alertService.showError($translate.instant('error.general'));
    return;
  }

  $scope.currentStateName = $state.current.name;

  $scope.getDojoURL = dojoUtils.getDojoURL;


  if ($stateParams.showBannerMessage) {
    atomicNotifyService.info($translate.instant('Please complete your profile before continuing.'), 5000);
  }

  $scope.$on('$destroy', function(){
    atomicNotifyService.dismissAll();
  });

  $scope.editMode = false;
  $scope.publicMode = false;
  $scope.publicChampion = false;
  $scope.loggedInUserIsMemberOfDojoChampion = false;
  var profileUserId = $state.params.userId;
  var loggedInUserId = loggedInUser.data && loggedInUser.data.id;
  var getHighestUserType = utilsService.getHighestUserType;

  if($state.current.name === 'edit-user-profile') {
    if(profileUserId === loggedInUserId || loggedInUserIsParent()) {
      $scope.editMode = true;
      $scope.inviteNinjaPopover = {
        title: $translate.instant('Invite Youth over 13'),
        templateUrl: '/profiles/template/invite-ninja-over-13',
        placement: 'top',
        placeholder: $translate.instant('Enter Youth Email Address'),
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

  $scope.upload = function (file) {
    if ($scope.profile.id && file) {
      return Upload.upload({
        url: '/api/2.0/profiles/change-avatar',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        file: file,
        fields: {profileId: profile.data.id, fileName: file.name, fileType: file.type}
      }).progress(function (evt) {
      }).success(function (data, status, headers, config) {
        if(data.ok === false) return alertService.showError($translate.instant(data.why));
      }).error(function (data, status, headers, config) {
        alertService.showError($translate.instant('There was an error uploading your profile picture.'));
      })
      .then(function(){
        return '/api/2.0/profiles/' + $scope.profile.id + '/avatar_img';
      });
    }
  };


  function getHiddenFields(hiddenFields, userTypes){
    var retHiddenFields = [];

    _.each(userTypes, function(userType){
      var filteredFields = _.filter(hiddenFields, function(hiddenField){
        return _.includes(hiddenField.allowedUserTypes, userType);
      });

      retHiddenFields = _.union(retHiddenFields, filteredFields);
    });

    return retHiddenFields;
  }

  $scope.hiddenFields =  getHiddenFields(hiddenFields.data, profile.data.userTypes);
  $scope.badgeInfo = {};
  $scope.badgeInfoIsCollapsed = {};
  var lastClicked = {};
  $scope.hasAccess = utils.hasAccess;
  // $scope.avatar = cdUsersService.getAvatar.bind(profile.id);
  if(profile.data.dob) profile.data.formattedDateOfBirth = moment(profile.data.dob).format('DD MMMM YYYY');
  $scope.highestUserType = getHighestUserType(profile.data.userTypes);
  var userTypeFound = _.find(initUserTypes.data, function (initUserType) {
    return initUserType.name === $scope.highestUserType;
  });
  $scope.defaultAvatar = userUtils.defaultAvatar($scope.highestUserType);

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

  $scope.showBadgeModal = function (badge) {
    var badgeModal = $uibModal.open({
      controller: function () {
        this.badge = badge;
        this.close = badgeModal.close;
      },
      bindToController: true,
      controllerAs: '$ctrl',
      template: '<div><cd-badge-cert badge="$ctrl.badge" /><div class="modal-footer"><button ng-click="$ctrl.close()" class="btn btn-default pull-right">' + $translate.instant('Close') + '</button></div>',
      size: 'lg'
    });
  };

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

  profile.data.dob = new Date(profile.data.dob);

  $scope.profile = profile.data;
  $scope.canEdit = $scope.profile.ownProfileFlag || $scope.profile.myChild;

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

    data.emailSubject = 'You have been invited to register as a parent/guardian on Zen, the CoderDojo community platform.';
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

    cdUsersService.loadDojoAdminsForUserPromise(loggedInUser.data.id).then(
      function(champions){
        $scope.loggedInUserIsMemberOfDojoChampion = !!(_.find(champions, function (championForUser) {
          return championForUser.id === profileUserId;
        }));
      }
    );
  }


  function findHighestUserType() {
    var highestTypeFound = false;

    function checkLinks(userType) {
      for(var i = 0; i < usersDojos.length; i++) {
        var userDojoLink = usersDojos[i];
        var userTypes = userDojoLink.userTypes;
        if(_.includes(userTypes, userType)) {
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
      'formattedDateOfBirth', 'user', 'userTypeTitle', 'requestingUserIsDojoAdmin', 'requestingUserIsChampion', 'requestingOwnProfile',
       'isOpen']);

    var childrenCopy = _.omit(profileCopy, ['address','alpha3','avatar','badges','countryname',
      'countrynumber','email','entity$','gender','userId','languageSpoken','lastEdited','linkedin','ninjaInvites',
      'notes','optionalHiddenFields','parentInvites','phone','projects','state','twitter','userType','userTypes',
      'parents', 'requiredFieldsComplete', 'id', 'children']);

      async.series([
        function(callback){
          if( !_.isUndefined($state.params.parentId) || !_.isEmpty(profileCopy.parents) ) {
            if(_.isEmpty(profileCopy.parents)){
              profileCopy.parents = [];
            }
            if($state.params.parentId && !_.includes(profileCopy.parents, $state.params.parentId)){
              profileCopy.parents.push($state.params.parentId);
            }
            saveYouthViaParent(profileCopy, callback);
          }else{
            saveDirect(profileCopy, callback);
          }
        },
        function(callback){
          if($scope.profile.children !== null) {
            localStorage.setItem('children', 'true');
            async.mapSeries($scope.profile.children, function(child, doneChild){
              childrenCopy.name = child.name;
              childrenCopy.alias = child.alias;
              childrenCopy.dob = child.dateOfBirth;
              childrenCopy.gender = child.gender;
              childrenCopy.email = child.email;
              childrenCopy.parents = [profileCopy.id];
              if(getAge(child.dateOfBirth) >=13){
                childrenCopy.userTypes = ['attendee-o13'];
              } else {
                childrenCopy.userTypes = ['attendee-u13'];
              }
              saveYouthViaParent(childrenCopy, doneChild);
            }, function(err, results){
              callback(err, results);
            });
          }else{
            callback(null, []);
          }
        }
      ], function (err, results) {
          results = _.flatten(results);
          var messages = [];
          //  Server error
          if (err) {
            return alertService.showError($translate.instant('An error has occurred while saving profile'));
          } else { // Functional errors
            var errorous = false;
            _.each( results, function (result) {
              if(result && result.error){
                var error_string = "";
                error_string = result.error === 'nick-exists' ? $translate.instant('Alias already exists.') : result.error;
                messages.push($translate.instant('An error has occurred while saving youth profile') + ': ' + error_string);
                errorous = true;
              }
              if (result && result.ok === false) {
                messages.push($translate.instant(result.why));
                errorous = true;
              } else {
                messages.push($translate.instant('Profile(s) have been saved successfully'));
              }
            });
            var message = _.uniq(messages).join('</br>');
            if(errorous){
              return alertService.showError(message);
            } else {
              $scope.profile = profile;
              $scope.profile.private =  $scope.profile.private ? "true" : "false";
              alertService.showAlert(message);
              auth.instance(function(data){
                if ( data.user ) $rootScope.$broadcast('user-updated', data.user);
                if ($scope.referer){
                  $window.location.href = $scope.referer;
                } else {
                  goTo();
                }
              });
            }
          }
      });

  };

  function saveYouthViaParent(profile, callback){
    profile = _.omit(profile, ['dojos']);
    profile.programmingLanguages = profile.programmingLanguages && utils.frTags(profile.programmingLanguages);
    profile.languagesSpoken = profile.languagesSpoken && utils.frTags(profile.languagesSpoken);
    cdUsersService.saveYouthProfile(profile, saveProfileWorked.bind({callback: callback}), saveProfileFailed.bind({callback: callback}));
  }

  function saveDirect(profile, callback){
    profile = _.omit(profile, ['userTypes', 'dojos', 'children']);

    profile.programmingLanguages = profile.programmingLanguages && utils.frTags(profile.programmingLanguages);
    profile.languagesSpoken = profile.languagesSpoken && utils.frTags(profile.languagesSpoken);

    cdUsersService.saveProfile(profile, saveProfileWorked.bind({callback: callback}), saveProfileFailed.bind({callback: callback}));
  }
  function saveProfileWorked (response){
    this.callback(null, response);
  }
  function saveProfileFailed (err){
    this.callback(err);
  }

  $scope.toggleEdit = function(field){
    $scope[field] = $scope[field] ? false : true;
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.picker = {opened: false};

  $scope.open = function ($event, opened) {
    $event.preventDefault();
    $event.stopPropagation();
    opened.isOpen = true;
  };

  cdDojoService.listCountries(function(countries) {
    $scope.countries = countries;
  });

  var initialDate = new Date();
  initialDate.setFullYear(initialDate.getFullYear()-18);
  $scope.dobDateOptions = $scope.childDobDateOptions = {
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

  /** Define for template usage if the email address is a required field based upon userType
  **/
  $scope.isEmailRequired = function(){
      if($scope.profile && ($scope.profile.userTypes.indexOf('attendee-u13') > -1 ||
         $scope.profile.userTypes.indexOf('attendee-o13') > -1)){
        return false;
      }
      return true;
  };

  $scope.getPlaces = function (countryCode, $select) {
    return utilsService.getPlaces(countryCode, $select).then(function (data) {
      $scope.places = data;
    }, function (err) {
      $scope.places = [];
      console.error(err);
    });
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

  $scope.publicProfile = function () {
    var highestUserType = getHighestUserType(profile.data.userTypes);
    $scope.publicMode = !$scope.publicMode;
    if (highestUserType === 'champion') {
      $scope.publicMode = false;
      $scope.publicChampion = !$scope.publicChampion;
    }
  }
  if ($state.params.public) {
    $scope.publicProfile();
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
        if(loggedInUserIsChild()) return true;
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

  $scope.areChildrenVisible = function () {
    if($state.current.name === 'add-child') return true;
    var highestUserType = getHighestUserType(profile.data.userTypes);
    switch (highestUserType) {
      case 'champion':
      case 'mentor':
      case 'parent-guardian':
        if($scope.profile.ownProfileFlag) return true;
        if(loggedInUserIsDojoAdmin()) return true;
        if(loggedInUserIsChild()) return true;
        return false; //Always private
      case 'attendee-o13':
        if(loggedInUserIsParent()) return true;
        return false;
      case 'attendee-u13':
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

  function loggedInUserIsChild() {
    if(!loggedInUser.data) return false;
    return _.find(profile.data.resolvedChildren, function (children) {
      return children.userId === loggedInUser.data.id;
    });
  }

  $scope.loggedInUserIsCDFAdmin = function () {
    if(!loggedInUser.data) return false;
    return _.includes(loggedInUser.data.roles, 'cdf-admin');
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
    return _.includes(hiddenField.allowedUserTypes, $scope.highestUserType);
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
      emailSubject: 'You have been invited to connect with a parent/guardian on Zen!'
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

  $scope.scrollToInvalid = function (form) {
    if (form.$invalid) {
      angular.element('form[name=' + form.$name + '] .ng-invalid')[0].scrollIntoView();
    }
  };

  $scope.initialForm = function () { //if no event id, user is not taking flow from dojo through booking
    if($stateParams.eventId){
      return false;
    } else {
      return true;
    }
  }

  $scope.afterForm = function () {
    if(!$stateParams.eventId){
      return false;
    } else {
      return true;
    }
  }

  $scope.abilityToAddChildren = function (){ //dont show add children section if user is youth or is taking direct registration flow (not from booking event ticket)
    if($scope.profile && ($scope.profile.userTypes.indexOf('attendee-u13') > -1 ||
       $scope.profile.userTypes.indexOf('attendee-o13') > -1) || (!$stateParams.eventId)){
      return false;
    }
    return true;
  };

  $scope.profile.children = [{name: null, alias: null, dateOfBirth:null, email: null, gender: null}];

  $scope.addChild = function () { //add another child object
    var child = {
      name: null,
      alias: null,
      dateOfBirth: null,
      email: null,
      gender: null
    };
    $scope.profile.children.push(child);
  }

  $scope.removeChild = function ($index) {
    return $scope.profile.children.splice($index, 1);
  };

  $scope.hideRemoveChild = function () {
    if($scope.profile.children.length === 0){
      return false;
    } else {
      return true;
    }
  }

  function getAge(birthday) {
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  function goTo(){
    var eventId = $stateParams.eventId;
    if (eventId){
      $state.go('event', {
        eventId: eventId,
        joinDojo: true
      });
    } else {
      var userId = $state.params.userId || $state.params.parentId;
      $state.go('user-profile', {userId: userId});
    }
  }

  if(profile.data.userType==='attendee-o13' || !$stateParams.eventId){ //youth can't have children
    $scope.profile.children = null;
  }

}

angular.module('cpZenPlatform')
  .controller('user-profile-controller', ['$scope', '$rootScope', '$state', '$window', 'auth', 'cdUsersService', 'cdDojoService', 'alertService',
    '$translate', 'profile', 'utilsService', 'loggedInUser', 'usersDojos', '$stateParams',
    'hiddenFields', 'Upload', 'cdBadgesService', 'utilsService', 'initUserTypes', 'cdProgrammingLanguagesService',
    'agreement','championsForUser', 'parentsForUser', 'badgeCategories', 'dojoAdminsForUser', 'usSpinnerService', 'atomicNotifyService', 'dojoUtils', '$timeout', 'userUtils', '$uibModal', cdUserProfileCtrl]);
