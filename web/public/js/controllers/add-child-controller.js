'use strict';

function addChildController($scope, $stateParams, alertService, utilsService, cdCountriesService, cdUsersService){
  console.log("stateParams", $stateParams);

  if($stateParams.userType !== 'attendee-u13' && $stateParams.userType !== 'attendee-o13'){
    alertService.showError('An error has occurred');
    return;
  }

  $scope.youthUser = true;

  $scope.profile = {
    ownProfileFlag: true,
    userTypes: [$stateParams.userType],
    parent: $stateParams.parentId
  };

  $scope.save = function(profile){
    var profileCopy = angular.copy(profile);
    
    delete profileCopy.ownProfileFlag;
    delete profileCopy.countryName;
    
    cdUsersService.saveYouthProfile(profileCopy, function(){
      alertService.showAlert('Save was successful');
    }, function(){
      alertService.showError('An error has occurred');
    });
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


  $scope.hasAccess = utilsService.hasAccess;
}

angular.module('cpZenPlatform')
  .controller('add-child-controller',['$scope', '$stateParams', 'alertService', 'utilsService', 
    'cdCountriesService', 'cdUsersService',addChildController]);