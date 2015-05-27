 'use strict';

function startDojoWizardCtrl($scope, $window, $state, $stateParams, $location, auth, alertService, WizardHandler, cdDojoService, cdCountriesService, cdUsersService, Geocoder, gmap, $translate) {
    $scope.stepFinishedLoading = false;
    $scope.wizardComplete = false;
    $scope.wizardCurrentStep = '';
    var currentStepInt = 0;
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
          if(currentStepInt === 4) {
            //Check if user has deleted the Dojo
            cdDojoService.find({dojoLeadId:dojoLead.id}, function (response) {
              if(!_.isEmpty(response)) {
                 $scope.wizardComplete = true; 
              } else {
                //Go back to Dojo Listing step
                initStep(3);
              }
            });
          }
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

    $scope.accountSuccessfullyRegistered = function () {
      if(currentStepInt > 0) return true;
      return false;      
    }

    $scope.championApplicationSubmitted = function () {
      if(currentStepInt > 1) return true;
      return false;
    }

    $scope.dojoSetup = function () {
      if(currentStepInt > 2) return true;
      return false;
    }

    $scope.createdDojoListing = function() {
      if(currentStepInt > 3) return true;
      return false;
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

    //--Step One:
    function setupStep1() {
      $scope.hideIndicators = true;
      currentStepInt = 0;
      $scope.doRegister = function(user) {
        auth.register(user, function(data) {
          if(data.ok) {
            auth.login(user, function(data) {
              //User is now logged in, go to dashboard
              $window.location.href = '/dashboard/start-dojo';
            });
          } else {
            var reason = data.why === 'nick-exists' ? $translate.instant('user name already exists') : $translate.instant('server error');
            alertService.showAlert($translate.instant('login.register.failure') + ' ' + reason);
          }
        }, function() {
          
        });
      }

      WizardHandler.wizard().goTo(0);
      $scope.stepFinishedLoading = true;
    }
    //--

    //--Step Two:
    function setupStep2() {
      $scope.hideIndicators = false;
      currentStepInt = 1;
      $scope.championRegistrationFormVisible = true;
      var currentUser;
      var dojoLead;

      $scope.champion = {};
      auth.get_loggedin_user(function (user) {
        currentUser = user;
        if(currentUser) {
          $scope.champion.email = currentUser.email;
          $scope.champion.name = currentUser.name;
          cdDojoService.loadUserDojoLead(currentUser.id, function (response) {
          if(!_.isEmpty(response)) {
            dojoLead = response;
          } else {
            dojoLead = {application:{}};
          }
        });
        }
      });

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];
      
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.today = new Date();
      $scope.answers = [$translate.instant('Yes'), $translate.instant('No')];

      $scope.save = function(champion) {
        dojoLead.application.championDetails = champion;
        dojoLead.userId = currentUser.id;
        dojoLead.email = currentUser.email;
        cdDojoService.saveDojoLead(dojoLead, function(response) {
          dojoLead = response;
          $scope.showCharterAgreement();
        });
      }

      $scope.showCharterAgreement = function () {
        $scope.championRegistrationFormVisible = false;
      }

      $scope.acceptCharterAgreement = function () {
        dojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
        cdDojoService.saveDojoLead(dojoLead, function (response) {
          setupStep3();
        });
      }

      cdCountriesService.listCountries(function(countries) {
        $scope.countries = _.map(countries, function(country) {
          return _.omit(country, 'entity$');
        });
      });

      $scope.otherLanguageSelected = function () {
        var otherSelected = _.contains($scope.champion.languagesSpoken, $translate.instant('Other'));
        return otherSelected;
      }

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

      $scope.referredBy = [
        "Google",
        $translate.instant('NewspaperMagazine'),
        $translate.instant('Radio'),
        $translate.instant('FamilyFriends'),
        $translate.instant('Other')
      ];

      WizardHandler.wizard().goTo(1, true);
      $scope.stepFinishedLoading = true;
    }
    //--

    //--Step Three:
    function setupStep3() {
      $scope.hideIndicators = false;
      currentStepInt = 2;
      $scope.setupDojo = {};
      var currentUser;
      auth.get_loggedin_user(function (user) {
        currentUser = user;
      });

      cdDojoService.loadSetupDojoSteps(function (steps) {
        $scope.steps = _.map(steps, function(step){
          step.title = $translate.instant(step.title);

          if(step.checkboxes){
            step.checkboxes = _.map(step.checkboxes, function(checkbox){
              if(checkbox.title){
                checkbox.title = $translate.instant(checkbox.title);
              }

              if(checkbox.placeholder){
                checkbox.placeholder = $translate.instant(checkbox.placeholder);
              }

              if(checkbox.requiredMessage){
                checkbox.requiredMessage = $translate.instant(checkbox.requiredMessage);
              }

              return checkbox;
            });
          }

          return steps;
        });
        $scope.steps = steps;
      });

      $scope.submitSetupYourDojo = function (setupDojo) {
        cdDojoService.loadUserDojoLead(currentUser.id, function(response) {
          var updatedDojoLead = response;
          updatedDojoLead.application.setupYourDojo = setupDojo;
          updatedDojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
          cdDojoService.saveDojoLead(updatedDojoLead, function(response) {
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
      currentStepInt = 3;
      var currentUser;
      auth.get_loggedin_user(function(user) {
        currentUser = user;
      });

      $scope.dojo = {};
      $scope.model = {};
      $scope.saveButtonText = $translate.instant('Create Dojo');

      auth.get_loggedin_user(function(user) {
        $scope.user = user;
      });

      $scope.createDojoUrl = $state.current.url;

      cdCountriesService.listCountries(function(countries) {
        $scope.countries = _.map(countries, function(country) {
          return _.omit(country, 'entity$');
        });
      });

      $scope.setCountry = function(dojo, country) {
        dojo.countryName = country.countryName;
        dojo.countryNumber = country.countryNumber;
        dojo.continent = country.continent;
        dojo.alpha2 = country.alpha2;
        dojo.alpha3 = country.alpha3;
      };

      var initContent = "<p><ul> \
        <li>" + $translate.instant('dojo.create.initcontent.li1') +"</li> \
        <li>"+ $translate.instant('dojo.create.initcontent.li2') +"</li> \
        <li><b>" + $translate.instant('dojo.create.initcontent.li3') +"</b></li> \
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
              //Make user champion
              //TO-DO:User should only be made champion of this Dojo.
              cdUsersService.promote(currentUser.id, ['champion'], function (response) {
                $state.go('home', { 
                  bannerType:'success', 
                  bannerMessage: $translate.instant('dojo.create.success')
                });
              });
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
        $scope.$watch('model.map', function(map) {
          if(map) { 
            setTimeout(function () {
              google.maps.event.trigger($scope.model.map, 'resize');
              var center = new google.maps.LatLng(53.344415, -6.260147);
            }, 100);
          }
        });
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
    .controller('start-dojo-wizard-controller', ['$scope', '$window', '$state', 
      '$stateParams', '$location', 'auth', 'alertService', 'WizardHandler', 
      'cdDojoService', 'cdCountriesService', 'cdUsersService', 'Geocoder', 
      'gmap', '$translate',startDojoWizardCtrl]);

