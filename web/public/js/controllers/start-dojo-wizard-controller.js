 'use strict';

function startDojoWizardCtrl($scope, $window, $state, $stateParams, $location, auth, alertService, WizardHandler, cdDojoService, cdCountriesService, Geocoder, gmap) {
    var registeredSuccessfully = false;
    var championApplicationSent = false;
    var dojoSetup = false;
    var createdDojoListing = false;
    $scope.stepFinishedLoading = false;
    $scope.wizardCurrentStep = '';
    var currentStepInt;
    var stepNames = [
                      'Register Account',
                      'Champion Registration',
                      'Setup your Dojo',
                      'Dojo Listing'
                    ];

    //Check if user has already started the wizard.
    auth.get_loggedin_user(function(user) {
      var currentPath = $location.path();
      if(!_.isEmpty(user) && currentPath === '/start-dojo') {
        $window.location.href = '/dashboard/start-dojo';
      } else {
        cdDojoService.loadUserDojoLead(user.id, function(dojoLead) {
          currentStepInt = dojoLead.currentStep;
          if(dojoLead.currentStep) {
            initStep(dojoLead.currentStep);
          } else {
            initStep(1);
          }
        });
      }
    }, function () {
      //User not logged in
      initStep(0);
    });

    function initStep (step) {
      switch(step) {
        case 0:
          setupStep1();
          break;
        case 1:
          setupStep2();
          break;
        case 2:
          setupStep3();
          break;
        case 3:
          setupStep4();
          break;
      }
    }

    $scope.preventEnterRegisterAccount = function () {
      if(currentStepInt > 0) return false;
      return true;
    }

    $scope.preventEnterChampionRegistration = function () {
      if(currentStepInt > 1) return false;
      return true;
    }

    $scope.preventEnterSetupDojo = function () {
      if(currentStepInt > 2) return false;
      return true;
    }

    $scope.preventEnterDojoListing = function () {
      if(currentStepInt > 3) return false;
      return true;
    }

    //--Step One:
    function setupStep1() {
      $scope.hideIndicators = true;
      $scope.doRegister = function(user) {
        auth.register(user, function(data) {
          if(data.ok) {
            auth.login(user, function(data) {
              registeredSuccessfully = true;
              setupStep2();
            });
          } else {
            alertService.showAlert('There was a problem registering your account:' + data.why);
            registeredSuccessfully = false;
          }
        }, function() {
          
        });
      }

      $scope.accountSuccessfullyRegistered = function () {
        if(registeredSuccessfully) return true;
        return false;      
      }
      WizardHandler.wizard().goTo(0);
      $scope.stepFinishedLoading = true;
    }
    //--

    //--Step Two:
    function setupStep2() {
      $scope.hideIndicators = false;
      $scope.championRegistrationFormVisible = true;
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
        dojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
        cdDojoService.saveDojoLead(dojoLead, function(response) {
          $scope.showCharterAgreement();
        });
      }

      $scope.showCharterAgreement = function () {
        $scope.championRegistrationFormVisible = false;
      }

      $scope.acceptCharterAgreement = function () {
        championApplicationSent = true;
        setupStep3();
      }

      cdCountriesService.listCountries(function(countries) {
        $scope.countries = _.map(countries, function(country) {
          return _.omit(country, 'entity$');
        });
      });

      $scope.otherLanguageSelected = function () {
        var otherSelected = _.contains($scope.champion.languagesSpoken, 'Other');
        return otherSelected;
      }

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

      $scope.setCountry = function(champion, country) {
        champion.countryName = country.countryName;
        champion.countryNumber = country.countryNumber;
        champion.continent = country.continent;
        champion.alpha2 = country.alpha2;
        champion.alpha3 = country.alpha3;
      };

      $scope.setPlace = function(champion, place) {
        champion.placeName = place.name;
        champion.placeGeonameId = place.geonameId;
        champion.county = {};
        champion.state = {};
        champion.city = {};
        for (var adminidx=1; adminidx<=4; adminidx++) {
          champion['admin'+ adminidx + 'Code'] = place['admin'+ adminidx + 'Code'];
          champion['admin'+ adminidx + 'Name'] = place['admin'+ adminidx + 'Name'];
        }
      };

      $scope.championApplicationSubmitted = function () {
        if(championApplicationSent) return true;
        return false;
      }

      $scope.referredBy = [
        "Google",
        "Newspaper/Magazine",
        "Radio",
        "Family/Friends",
        "Other"
      ];

      WizardHandler.wizard().goTo(1, true);
      $scope.stepFinishedLoading = true;
    }
    //--

    //--Step Three:
    function setupStep3() {
      $scope.hideIndicators = false;
      $scope.setupDojo = {};
      var currentUser;
      auth.get_loggedin_user(function (user) {
        currentUser = user;
      });

      $scope.dojoSetup = function () {
        if(dojoSetup) return true;
        return false;
      }

      cdDojoService.loadSetupDojoSteps(function (response) {
        $scope.steps = response;
      });

      $scope.submitSetupYourDojo = function (setupDojo) {
        cdDojoService.loadUserDojoLead(currentUser.id, function(response) {
          var updatedDojoLead = response;
          updatedDojoLead.application.setupYourDojo = setupDojo;
          updatedDojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
          cdDojoService.saveDojoLead(updatedDojoLead, function(response) {
            dojoSetup = true;
            setupStep4();
          });
        });
      }

      $scope.openAllSteps = function (context) {
        var formInvalid = context.setupYourDojoForm.$invalid;
        if(formInvalid) {
          $scope.steps.map(function(step){
            step.open = true;
          });
        }
      }

      WizardHandler.wizard().goTo(2, true);
      $scope.stepFinishedLoading = true;
    }
    //--

    //--Step Four:
    function setupStep4() {
      $scope.hideIndicators = false;
      var currentUser;
      auth.get_loggedin_user(function(user) {
        currentUser = user;
      });

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
          $scope.places = _.map(result.records, function(place) {
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
          dojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
          cdDojoService.saveDojoLead(dojoLead, function (response) {
            dojo.dojoLeadId = response.id;
            cdDojoService.save(dojo, function (response) {
              createdDojoListing = true;
              //TO-DO:Go to Dojo Listing page when dojo is saved.
            });
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
      WizardHandler.wizard().goTo(3, true);
      $scope.stepFinishedLoading = true;
    }
    //--

}

angular.module('cpZenPlatform')
    .controller('start-dojo-wizard-controller', ['$scope', '$window', '$state', '$stateParams', '$location', 'auth', 'alertService', 'WizardHandler', 'cdDojoService', 'cdCountriesService', 'Geocoder', 'gmap', startDojoWizardCtrl]);

