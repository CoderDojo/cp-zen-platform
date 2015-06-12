'use strict';

function cdUserProfileCtrl($scope, $state, auth, cdUsersService, cdDojoService, alertService, $translate, cdCountriesService) {
  var userId = $state.params.userId;
  var userType;
  $scope.profileData = {};

  cdUsersService.load(userId, function (response) {
    $scope.profileData.user = response;
    cdUsersService.listProfiles({userId:userId}, function (response) {
      $scope.profileData.profile = response;
    });
  }, function (err) {
    alertService.showError($translate.instant('Error loading profile') + ' ' + err);
  });

  cdDojoService.dojosForUser(userId, function (response) {
    $scope.dojos = response;
    if(_.isEmpty($scope.dojos)) {
      //This user has no Dojos.
      //Use init user type to setup profile.
      auth.get_loggedin_user(function (user) {
        userType = user.initUserType.name;
      });
    } else {
      //Search usersdojos for highest user type
      findHighestUserType();
    }
  }, function (err) {
    alertService.showError( $translate.instant('Error loading Dojos') + ' ' + err);
  });

  function findHighestUserType() {
    var highestTypeFound = false;
    cdDojoService.getUsersDojos({userId:userId}, function (usersDojosLinks) {

      function checkLinks(userType) {
        for(var i = 0; i < usersDojosLinks.length; i++) {
          var userDojoLink = usersDojosLinks[i];
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
        if(!highestTypeFound) userType = checkLinks(searchForUserType);
      });

    });
  }

  $scope.save = function(profile){
    function win(profile){
      $scope.profile = profile;
    }

    function fail(){
      alertService.showError('An error has occurred while saving profile');
    }

    profile.languagesSpoken = profile.languagesSpoken.split(',');
    profile.languages = profile.languages.split(',');
    profile.projects = profile.projects.split(',');

    cdUsersService.saveProfile(profile, win, fail);
  };
  
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

    cdCountriesService.listPlaces(query).then(function(result) {
      $scope.places = _.map(result, function(place) {
        return _.omit(place, 'entity$');
      });
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
  $scope.format = $scope.formats[0];
}

angular.module('cpZenPlatform')
  .controller('user-profile-controller', ['$scope', '$state', 'auth', 'cdUsersService', 'cdDojoService', 'alertService', '$translate' , 'cdCountriesService', cdUserProfileCtrl]);

