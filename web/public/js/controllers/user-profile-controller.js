'use strict';

function cdUserProfileCtrl($scope, $state, auth, cdUsersService, cdDojoService, alertService, 
  $translate, cdCountriesService, profile, utils, loggedInUser, usersDojos, $stateParams) {
  

  if(profile.err || loggedInUser.err || usersDojos.err){
    alertService.showError('An error has occurred');
    return;
  }

  $scope.hasAccess = utils.hasAccess;

  $scope.profile = profile.data;
  
  $scope.loggedInUser = loggedInUser.data;

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
      'passwordConfirm', 'myChild', 'resolvedChildren']);
    
    if($stateParams.userType === 'attendee-o13' || $stateParams.userType === 'attendee-u13' || profile.myChild){
      saveYouthViaParent(profileCopy);
    } else {
      saveDirect(profileCopy);
    }
  };
  
  function saveYouthViaParent(profile){
    cdUsersService.saveYouthProfile(profile, function(){
      alertService.showAlert('Save was successful');
    }, function(){
      alertService.showError('An error has occurred');
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
      alertService.showAlert('Profile has been saved successfully');
    }

    function fail(){
      alertService.showError('An error has occurred while saving profile');
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
}

angular.module('cpZenPlatform')
  .controller('user-profile-controller', ['$scope', '$state', 'auth', 'cdUsersService', 'cdDojoService', 'alertService', 
    '$translate' , 'cdCountriesService', 'profile', 'utilsService', 'loggedInUser', 'usersDojos', '$stateParams' , cdUserProfileCtrl]);

