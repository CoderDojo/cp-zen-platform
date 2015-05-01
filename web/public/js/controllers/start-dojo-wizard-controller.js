 'use strict';

function startDojoWizardCtrl($scope, $window, $state, $stateParams, $location, auth, alertService, WizardHandler, cdDojoService, cdCountriesService, Geocoder, gmap) {
    var step = parseInt($stateParams.step);
    var registeredSuccessfully = false;
    var championApplicationSent = false;
    var teamGathered = false;
    var venueVerified = false;
    var dojoContentComplete = false;
    var createdDojoListing = false;
    var createdEvent = false;
    var promotedDojo = false;

    $scope.wizardCurrentStep = '';

    $scope.$watch('wizardCurrentStep', function (step) {
      switch(step) {
        case 'Register Account':
          setupStep1();
          break;
        case 'Champion Registration':
          setupStep2();
          break;
        case 'Gather Team':
          setupStep3();
          break;
        case 'Find Venue':
          setupStep4();
          break;
        case 'Dojo Content':
          setupStep5();
          break;
        case 'Dojo Listing':
          setupStep6();
          break;
        case 'Create Event':
          setupStep7();
          break;
        case 'Promote':
          setupStep8();
          break;
      }
    });

    //--Step One:
    function setupStep1() {
      $scope.doRegister = function(user) {
        auth.register(user, function(data) {
          if(data.ok) {
            auth.login(user, function(data) {
              registeredSuccessfully = true;
              WizardHandler.wizard().next();
            });
          } else {
            alertService.showAlert('There was a problem registering your account:' + data.why);
            registeredSuccessfully = false;
          }
        }, function() {
          
        });
      }

      $scope.preventEnterRegisterAccount = function () {
        return false;
      }

      $scope.accountSuccessfullyRegistered = function () {
        if(registeredSuccessfully) return true;
        return false;      
      }
    }
    //--

    //--Step Two:
    function setupStep2() {
      var currentUser;
      $scope.champion = {};
      auth.get_loggedin_user(function (user) {
        currentUser = user;
        if(currentUser) {
          $scope.champion.email = currentUser.email;
          $scope.champion.name = currentUser.name;
        }
      });

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];
      
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.today = new Date();

      $scope.answers = ['Yes', 'No'];

      $scope.save = function(champion) {
        var dojoLead = {application:{}};
        dojoLead.application.championDetails = champion;
        dojoLead.userId = currentUser.id;
        dojoLead.email = currentUser.email;
        //dojoLead.currentStep = $scope.wizardCurrentStep;
        cdDojoService.saveDojoLead(dojoLead, function(response) {
          championApplicationSent = true;
          WizardHandler.wizard().next();
        });
      }

      $scope.championApplicationSubmitted = function () {
        if(championApplicationSent) return true;
        return false;
      }

      $scope.preventEnterChampionRegistration = function () {
        return false;
      }
    }
    //--

    //--Step Three:
    function setupStep3() {
      $scope.dojoPreparation = { gatherTeam:false, findMentors: false, backgroundCheck:false };
      var currentUser;
      auth.get_loggedin_user(function (user) {
        currentUser = user;
      });

      $scope.submitDojoPreparation = function (dojoPreparation) {
        cdDojoService.loadUserDojoLead(currentUser.id, function(response) {
          var updatedDojoLead = response;
          updatedDojoLead.application.dojoPreparation = dojoPreparation;
          //updatedDojoLead.currentStep = $scope.wizardCurrentStep;
          cdDojoService.saveDojoLead(updatedDojoLead, function(response) {
            teamGathered = true;
            WizardHandler.wizard().next();
          });
        });
      }

      $scope.teamGathered = function () {
        if(teamGathered) return true;
        return false;
      }

    }
    //--

    //--Step Four:
    function setupStep4() {
      $scope.venueVerified = function () {
        if(venueVerified) return true;
        return false;
      }

      $scope.submitFindVenue = function () {
        venueVerified = true;
        WizardHandler.wizard().next();
      }

    }
    //--

    //--Step Five:
    function setupStep5() {
      $scope.submitPlanDojoContent = function () {
        dojoContentComplete = true;
        WizardHandler.wizard().next();
      }
    }

    $scope.dojoContentComplete = function () {
      if(dojoContentComplete) return true;
      return false;
    }
    //--

    //--Step Six:
    function setupStep6() {
      var currentUser;
      auth.get_loggedin_user(function(user) {
        currentUser = user;
      })

      $scope.createdDojoListing = function() {
        if(createdDojoListing) return true;
        return false;
      }

      $scope.dojo = {};
      $scope.model = {};
      $scope.saveButtonText = 'Create Dojo';

      auth.get_loggedin_user(function(user) {
        $scope.user = user;
      });

      $scope.createDojoUrl = $state.current.url;

      cdCountriesService.listCountries(function(countries) {
        $scope.countries = _.map(countries, function(country) {
          return _.omit(country, 'entity$');
        });
      });

      $scope.getPlaces = function(countryCode, search) {
        if (!countryCode || !search.length || search.length < 3) {
          $scope.places = [];
          return;
        }

        cdCountriesService.listPlaces(countryCode, search, function(places) {
          $scope.places = _.map(places, function(place) {
            return _.omit(place, 'entity$');
          });
        });
      };

      $scope.setCountry = function(dojo, country) {
        dojo.countryName = country.countryName;
        dojo.countryNumber = country.countryNumber;
        dojo.continent = country.continent;
        dojo.alpha2 = country.alpha2;
        dojo.alpha3 = country.alpha3;
      };

      $scope.setPlace = function(dojo, place) {
        dojo.placeName = place.name;
        dojo.placeGeonameId = place.geonameId;
        dojo.county = {};
        dojo.state = {};
        dojo.city = {};
        for (var adminidx=1; adminidx<=4; adminidx++) {
          dojo['admin'+ adminidx + 'Code'] = place['admin'+ adminidx + 'Code'];
          dojo['admin'+ adminidx + 'Name'] = place['admin'+ adminidx + 'Name'];
        }
      };

      $scope.save = function(dojo) {
        cdDojoService.loadUserDojoLead(currentUser.id, function(response) {
          var dojoLead = response;
          dojoLead.application.dojoListing = dojo;
          //dojoLead.currentStep = $scope.wizardCurrentStep;
          cdDojoService.saveDojoLead(dojoLead, function(response) {
            createdDojoListing = true;
            WizardHandler.wizard().next();
          });
        })
      }

      $scope.markers = [];

      if(gmap) {
        $scope.mapLoaded = true;
        $scope.mapOptions = {
          center: new google.maps.LatLng(53.344415, -6.260147),
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      }

      $scope.addMarker = function($event, $params) {
        angular.forEach($scope.markers, function(marker) {
          marker.setMap(null);
        });
        $scope.markers.push(new google.maps.Marker({
          map: $scope.model.map,
          position: $params[0].latLng
        }));
        $scope.dojo.coordinates = $params[0].latLng.lat() + ', ' + $params[0].latLng.lng();
      };

      var initContent = "<p><ul> \
        <li>A pack lunch</li> \
        <li>A laptop. Borrow one from somebody if needs be.</li> \
        <li><b>A parent! (Very important). If you are 12 or under, your parent must stay with you during the session.</b></li> \
        </ul></p>";

      $scope.editorOptions = {
        language: 'en',
        uiColor: '#000000',
        height:'200px',
        initContent:initContent
      };

      $scope.getLocationFromAddress = function(dojo) {
        if(dojo && dojo.place) {
          var address = dojo.placeName;
          for (var adminidx=4; adminidx >= 1; adminidx--) {
            if (dojo['admin'+adminidx+'Name']) {
              address = address + ', ' + dojo['admin'+adminidx+'Name'];
            }
          }
          address = address + ', ' + dojo['countryName'];
          Geocoder.latLngForAddress(address).then(function (data) {
            $scope.mapOptions.center = new google.maps.LatLng(data.lat, data.lng);
            $scope.model.map.panTo($scope.mapOptions.center);
          });
        }
      }

    }
    //--

    //--Step Seven:
    function setupStep7() {
      $scope.createdEvent = function () {
        if(createdEvent) return true;
        return false;
      } 
    }
    //--

    //--Step Eight:
    function setupStep8() {
      $scope.promotedDojo = function () {
        if(promotedDojo) return true;
        return false;
      }
    }
    //--
}

angular.module('cpZenPlatform')
    .controller('start-dojo-wizard-controller', ['$scope', '$window', '$state', '$stateParams', '$location', 'auth', 'alertService', 'WizardHandler', 'cdDojoService', 'cdCountriesService', 'Geocoder', 'gmap', startDojoWizardCtrl]);

