 'use strict';
 /*global google*/

function startDojoWizardCtrl($scope, $http, $window, $state, $stateParams, $location, auth, $localStorage, alertService,
  WizardHandler, cdDojoService, cdUsersService, cdCountriesService, cdAgreementsService, gmap, $translate, utilsService,
  $sanitize, vcRecaptchaService, intercomService, $modal) {

  $scope.noop = angular.noop;
  $scope.stepFinishedLoading = false;
  $scope.wizardCurrentStep = '';
  var currentStepInt = 0;
  var stepNames = [
                    'Register Account',
                    'Champion Registration',
                    'Setup your Dojo',
                    'Dojo Listing'
                  ];

  $scope.recap = {publicKey: '6LfVKQgTAAAAAF3wUs0q-vfrtsKdHO1HCAkp6pnY'};
  setupGoogleMap();

  var fail = function(){
    alertService.showError($translate.instant('error.general'));
  };

  var failSave = function(){
    alertService.showError($translate.instant('An error has occurred while saving dojo lead'));
  };

  var failAuth = function(){
    alertService.showError($translate.instant('Unable to retrieve user details'));
  };

  //Check if user has already started the wizard.
  auth.get_loggedin_user(function(user) {
    var currentPath = $location.path();
    if(!_.isEmpty(user) && currentPath === '/start-dojo') {
      $window.location.href = '/dashboard/start-dojo';
    } else {
      cdDojoService.getDojoConfig(function(json){
        $scope.dojoConfig = json;
        $scope.dojoStages = json.dojoStages;
        $scope.dojoStates = json.verificationStates;
      }, fail);

      var query = { query : {
        filtered : {
          query : {
            match_all : {}
          },
          filter : {
            bool: {
              must: [{
                term: { userId: user.id }
              }]
            }
          }
        }
      }
      };

      cdDojoService.searchDojoLeads(query).then(function(result) {
        var results = _.map(result.records, function(dojoLead) {
          return _.omit(dojoLead, 'entity$');
        });

        var uncompletedDojoLead = null;

        _.each(results, function(dojoLead){
          if(!dojoLead.completed){
            uncompletedDojoLead = dojoLead;
          }
        });

        currentStepInt = uncompletedDojoLead ? uncompletedDojoLead.currentStep : 0;
        if (currentStepInt === 4) {
          //Check if user has deleted the Dojo
          cdDojoService.find({dojoLeadId: uncompletedDojoLead.id}, function (response) {
            if (!_.isEmpty(response)) {
              $state.go('dojo-list',
                { bannerType:'success',
                  bannerMessage: 'Your first Dojo application is awaiting verification. You can create a second Dojo after it has been verified.<br> ' +
                  'If you need help completing your initial Dojo application, please contact us at <a class="a-no-float" href="mailto:info@coderdojo.org">info@coderdojo.org</a>',
                  bannerTimeCollapse: 150000
                });
            } else {
              //Go back to Dojo Listing step
              initStep(3);
            }
          }, fail);
        } else if(results.length > 0 && !uncompletedDojoLead) {
          //make a copy of dojoLead here then initStep 2
          var dojoLead = _.cloneDeep(results[0]);
          dojoLead.completed = false;
          dojoLead.currentStep= 2;
          dojoLead.application.dojoListing = {};
          dojoLead.application.setupYourDojo = {};
          delete dojoLead.id;

          cdDojoService.saveDojoLead(dojoLead, function(response) {
              initStep(2);
            }, failSave);
        } else {
          if(uncompletedDojoLead){
            cdAgreementsService.loadUserAgreement(user.id, function(response){
              if(response && response.id){

                initStep(uncompletedDojoLead.currentStep);
              } else {
                initStep(1, 'charter');
              }
            }, fail);
          } else {
            //go to champion registration page
            initStep(1);
          }
        }
      }, function(){
        alertService.showError($translate.instant('error.general'));
      });
    }
  }, function () {
    //User not logged in
    initStep(0);
  });

  function initStep (step, subStep) {
    switch(step) {
      case 0:
        setupStep1();
        break;
      case 1:
        setupStep2(subStep);
        break;
      case 2:
        setupStep3();
        break;
      case 3:
        setupStep4();
        break;
    }
  }

  $scope.scrollToInvalid = function(form){
    // temp fix
    if(currentStepInt === 3) {
      $scope.getLocationFromAddress($scope.dojo);
      if($scope.dojo.place) {
        $scope.dojo.coordinates = $scope.dojo.place.latitude + ', ' + $scope.dojo.place.longitude;
      }
    }

    if(form.$invalid){
      angular.element('form[name=' + form.$name + '] .ng-invalid')[0].scrollIntoView();
    }
  };

  $scope.preventEnterRegisterAccount = function () {
      if(currentStepInt !== 0) return false;
      return true;
    }

  $scope.preventEnterChampionRegistration = function () {
      if(currentStepInt < 1) return false;
      if(WizardHandler.wizard().currentStepNumber() > 1 ) setupStep2("dontShowCharter", true);
      return true;
    }

  $scope.preventEnterSetupDojo = function () {
      if(currentStepInt < 2) return false;
      if(WizardHandler.wizard().currentStepNumber() > 2 ) setupStep3(true);
      return true;
    }

  $scope.preventEnterDojoListing = function () {
      if(currentStepInt < 3) return false;
      if(WizardHandler.wizard().currentStepNumber() >= 3 ) setupStep4(true);

      return true;
    }

  $scope.accountSuccessfullyRegistered = function () {
    if(currentStepInt > 0) return true;
    return false;
  }

  $scope.championApplicationSubmitted = function () {
      if(currentStepInt > 1) return true;
      if(WizardHandler.wizard().currentStepNumber() > 1) {
        setupStep3(true);
        return true;
      }
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

  $scope.getPlaces = function (countryCode, $select) {
    return utilsService.getPlaces(countryCode, $select).then(function (data) {
      $scope.places = data;
    }, function (err) {
      $scope.places = [];
      console.error(err);
    });
  }

  //--Step One:
  function setupStep1() {
    $scope.registerUser = {initUserType:{name:'champion', title:'Champion'}};
    $scope.hideIndicators = true;
    currentStepInt = 0;
    WizardHandler.wizard().goTo(0);
    $scope.onStartDojoWizard = true;
    $scope.stepFinishedLoading = true;
  }
  //--

  //--Step Two:
  function setupStep2(subStep, wizardRedirect) {
    var initialDate = new Date();
    $scope.buttonText = "Register Champion"
    initialDate.setFullYear(initialDate.getFullYear()-18);
    $scope.dobDateOptions = {
        formatYear: 'yyyy',
        startingDay: 1,
        'datepicker-mode': "'year'",
        initDate: initialDate
      };

    $scope.hideIndicators = false;
    $scope.stepTwoShowGmap = true;

    currentStepInt = 1;

    $scope.showCharterAgreement = function () {
      $scope.showCharterAgreementFlag = false;
    }

    var currentUser;
    auth.get_loggedin_user(function (user) {
      currentUser = user;
      if (currentUser) {
        $scope.champion.email = $scope.champion ? currentUser.email : '';
        $scope.champion.name = $scope.champion ? currentUser.name : '';
      }
    }, failAuth);

    if(subStep && subStep === 'charter'){
      $scope.showCharterAgreement();
    } else {
      $scope.showCharterAgreementFlag = true;

      $scope.champion = {};

      $scope.picker = {opened: false};

      $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.picker.opened = true;
      };

      $scope.today = new Date();
      $scope.answers = ['Yes', 'No'];

      $scope.save = function (champion) {
        var win = function(){
          var dojoLead = {application: {}};
          dojoLead.application.championDetails = champion;
          dojoLead.userId = currentUser.id;
          dojoLead.email = currentUser.email;
          dojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
          dojoLead.completed = false;
          cdDojoService.saveDojoLead(dojoLead, function (response) {
            $scope.showCharterAgreement();
            intercomService.InitIntercom();
          },failSave);
        };

        openConfirmation(win);
      };

      cdCountriesService.listCountries(function (countries) {
        $scope.countries = countries;
      }, fail);
    }

    $scope.acceptCharterAgreement = function (agreement) {

      var agreementObj = {};
      agreementObj.fullName = agreement.agreedToBy;
      agreementObj.userId = currentUser.id;
      agreementObj.agreementVersion = 2; //This is hardcoded for now; we don't have a way of changing the charter just yet.

      cdAgreementsService.save(agreementObj, function (response) {
        setupStep3();
      },failSave);


    }

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

    if(!wizardRedirect) {
      WizardHandler.wizard().goTo(1, true);
    }
    $scope.stepFinishedLoading = true;
  }
  //--

  //--Step Three:
  function setupStep3(wizardRedirect) {
    $scope.hideIndicators = false;
    currentStepInt = 2;
    $scope.setupDojo = {};
    var currentUser;
    auth.get_loggedin_user(function (user) {
      currentUser = user;
    }, failAuth);

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
    }, fail);

    $scope.submitSetupYourDojo = function (setupDojo) {

      var win = function(){
        cdDojoService.loadUserDojoLead(currentUser.id, function(response) {
          var updatedDojoLead = response;
          updatedDojoLead.application.setupYourDojo = setupDojo;
          updatedDojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
          cdDojoService.saveDojoLead(updatedDojoLead, function(response) {
            setupStep4();
          }, failSave);
        });
      };

      openConfirmation(win);
    };

    $scope.openAllSteps = function (context) {
      var formInvalid = context.setupYourDojoForm.$invalid;
      if(formInvalid) {
        $scope.steps.map(function(step){
          step.open = true;
        });
      } 
    };

    if(!wizardRedirect) {
      WizardHandler.wizard().goTo(2, true);
    }
    $scope.stepFinishedLoading = true;
  }
    //--

  //--Step Four:
  function setupStep4(wizardRedirect) {
    $scope.hideIndicators = false;
    $scope.buttonText = "Create Dojo"
      
    $scope.stepFourShowGmap = true;
      
    currentStepInt = 3;
    
    var currentUser;
    auth.get_loggedin_user(function(user) {
      currentUser = user;
    }, failAuth);

    $scope.dojo = {};
    $scope.dojo.stage = "0";

    auth.get_loggedin_user(function(user) {
      $scope.user = user;
    }, failAuth);




    $scope.createDojoUrl = $state.current.url;

    cdCountriesService.listCountries(function(countries) {
      $scope.countries = countries;
    }, fail);


    $scope.setCountry = function(dojo, country) {
      dojo.countryName = country.countryName;
      dojo.countryNumber = country.countryNumber;
      dojo.continent = country.continent;
      dojo.alpha2 = country.alpha2;
      dojo.alpha3 = country.alpha3;
    };

    var initContent = "<p><ul>" +
      "<li>" + $translate.instant('dojo.create.initcontent.li1') +"</li>" +
      "<li>"+ $translate.instant('dojo.create.initcontent.li2') +"</li>" +
      "<li><b>" + $translate.instant('dojo.create.initcontent.li3') +"</b></li>" +
      "</ul></p>";

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

    var sanitizeCdForms = {
      createDojo: ["address1","email","googleGroups","name","needMentors","notes","private","stage","supporterImage","time","twitter","website"]
    };

    $scope.save = function(dojo) {
      var win = function(){
        _.each(sanitizeCdForms.editDojo, function(item, i) {
          if(_.has(dojo, item)) {
            dojo[item] = $sanitize(dojo[item]);
          }
        });

        cdDojoService.loadUserDojoLead(currentUser.id, function(response) {
          var dojoLead = response;
          dojoLead.application.dojoListing = dojo;
          dojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
          cdDojoService.saveDojoLead(dojoLead, function (response) {
            dojo.dojoLeadId = response.id;
            cdDojoService.save(dojo, function (response) {

              //update intercom champion dojos
              intercomService.updateIntercom(response.dojo_id);

              $state.go('home', {
                bannerType:'success',
                bannerMessage: $translate.instant('dojo.create.success'),
                bannerTimeCollapse: 150000
              });
            });
          },failSave);
        }, fail); 
      };

      openConfirmation(win);
    };

    if(!wizardRedirect) {
      WizardHandler.wizard().goTo(3, true);
    }
    $scope.stepFinishedLoading = true;
  }

  function setupGoogleMap() {
    $scope.model = {markers:[]};

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

    $scope.addMarker = function($event, $params, obj) {
      angular.forEach($scope.model.markers, function(marker) {
        marker.setMap(null);
      });
      $scope.model.markers.push(new google.maps.Marker({
        map: $scope.model.map,
        position: $params[0].latLng
      }));
      obj.coordinates = $params[0].latLng.lat() + ', ' + $params[0].latLng.lng();
    };

    $scope.getLocationFromAddress = function(obj) {
      utilsService.getLocationFromAddress(obj).then(function (data) {
        $scope.mapOptions.center = new google.maps.LatLng(data.lat, data.lng);
        $scope.model.map.panTo($scope.mapOptions.center);
        angular.forEach($scope.model.markers, function(marker) {
          marker.setMap(null);
        });
        $scope.model.markers.push(new google.maps.Marker({
          map: $scope.model.map,
          position: $scope.mapOptions.center
        }));
        obj.coordinates = data.lat + ', ' + data.lng;
      }, function (err) {
        //Ask user to add location manually if google geocoding can't find location.
        alertService.showError($translate.instant('Please add your location manually by clicking on the map.'));
      });
    }

  }
  var openConfirmation = function (win, fail) {

    var modalInstance = $modal.open({
        animation: true,
        templateUrl: '/dojos/template/dojo-setup-confirm',
        controller: 'dojoSetupConfirmationCtrl',
      });

    modalInstance.result.then(win, fail);
  };

}

angular.module('cpZenPlatform')
  .controller('start-dojo-wizard-controller', ['$scope', '$http', '$window', '$state', '$stateParams', '$location', 'auth', '$localStorage', 'alertService', 
  'WizardHandler', 'cdDojoService', 'cdUsersService', 'cdCountriesService', 'cdAgreementsService', 'gmap', '$translate', 'utilsService',
  '$sanitize', 'vcRecaptchaService', 'intercomService', '$modal', startDojoWizardCtrl]);
