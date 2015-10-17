 'use strict';
 /*global google*/

function startDojoWizardCtrl($scope, $window, $state, $location, auth, alertService, WizardHandler, cdDojoService,
  cdAgreementsService, gmap, $translate, utilsService, intercomService, $modal, $localStorage, $sce) {

  $scope.noop = angular.noop;
  $scope.stepFinishedLoading = false;
  $scope.disableDojoCountryChange = false;
  $scope.wizardCurrentStep = '';
  var currentUser = null;
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
    currentUser = user;

    var currentPath = $location.path();
    if(!_.isEmpty(user) && currentPath === '/start-dojo') {
      $window.location.href = '/dashboard/start-dojo';
    } else {
      cdDojoService.getDojoConfig(function(json){
        $scope.dojoConfig = json;
        $scope.dojoStages = _.map(json.dojoStages, function(item){
          return { value: item.value, label: $translate.instant(item.label) };
        });
        $scope.dojoStates = _.map(json.verificationStates, function(item){
          return { value: item.value, label: $translate.instant(item.label) };
        });
      }, fail);

      var query = {userId: user.id};

      cdDojoService.searchDojoLeads(query).then(function (result) {
        var results = _.map(result, function(dojoLead) {
          return _.omit(dojoLead, 'entity$');
        });

        var uncompletedDojoLead = _.find(results, function(dojoLead){
          return dojoLead.completed === false;
        });

        var hasVerifiedDojo = _.find(results, function (dojoLead) {
          return dojoLead.completed === true;
        });

        currentStepInt = uncompletedDojoLead ? uncompletedDojoLead.currentStep : 0;
        if (currentStepInt === 4) {
          //Check if user has deleted the Dojo
          cdDojoService.find({dojoLeadId: uncompletedDojoLead.id}, function (response) {
            if (!_.isEmpty(response)) {
              $state.go('dojo-list',
                { bannerType:'success',
                  bannerMessage: $translate.instant('You have a Dojo application awaiting verification. You can create another Dojo after it has been verified.') +
                  $translate.instant('If you need help completing your initial Dojo application, please contact us at info@coderdojo.org'),
                  bannerTimeCollapse: 150000
                });
            } else {
              //Go back to Dojo Listing step
              initStep(3);
            }
          }, fail);
        } else if(results.length > 0 && !uncompletedDojoLead) {
          //make a copy of dojoLead here then initStep 2
          var dojoLead = _.omit(_.cloneDeep(results[0]), ['completed', 'converted', 'deleted', 'deletedAt', 'deletedBy', 'id', 'entity$']);
          dojoLead.completed = false;
          dojoLead.currentStep= 2;
          if(!dojoLead.application.championDetails) {
            dojoLead.application.championDetails = {
              email: user.email,
              name: user.name
            };
          }
          dojoLead.application.setupYourDojo = {};
          dojoLead.application.dojoListing = {};

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
    currentUser = null;
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
    var step2UpdateFlag;
    var savedDojoLead;
    $scope.champion = {};
    var initialDate = new Date();
    $scope.buttonText = $translate.instant('Register Champion');
    initialDate.setFullYear(initialDate.getFullYear()-18);
    $scope.dobDateOptions = {
      formatYear: 'yyyy',
      startingDay: 1,
      'datepicker-mode': "'year'",
      initDate: initialDate
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.fullDateFormat = $scope.formats[0];

    $scope.hideIndicators = false;
    $scope.stepTwoShowGmap = true;

    currentStepInt = 1;

    $scope.showCharterAgreement = function () {
      $scope.showCharterAgreementFlag = false;
    }

    auth.get_loggedin_user(function (user) {
      currentUser = user;
      if (currentUser) {
        $scope.champion.email = $scope.champion ? currentUser.email : '';
        $scope.champion.name = $scope.champion ? currentUser.name : '';

        cdDojoService.loadUserDojoLead(currentUser.id, function(response) {
          if(response.application && response.application.championDetails) {
            savedDojoLead = response;
            step2UpdateFlag = true;
            $scope.buttonText = $translate.instant("Update Champion");
            _.each(response.application.championDetails, function(item, i) {
              $scope.champion[i] = item;
            });
          }

          if($localStorage[user.id] && $localStorage[user.id].dojoLead && $localStorage[user.id].dojoLead.championDetails) {
            alertService.showAlert($translate.instant('There are unsaved changes on this page'));
            var lsc = $localStorage[user.id].dojoLead.championDetails;
            if(lsc.dateOfBirth) $scope.champion.dateOfBirth = lsc.dateOfBirth;
            if(lsc.phone) $scope.champion.phone = lsc.phone;
            if(lsc.country) {
              $scope.champion.country = lsc.country;
              $scope.setCountry($scope.champion, lsc.country);
            }
            if(lsc.place) {
              $scope.champion.place = lsc.place;
              $scope.setPlace($scope.champion, lsc.place);
            }
            if(lsc.country && lsc.place) {
              $scope.getLocationFromAddress($scope.champion);
            }
            if(lsc.address1) $scope.champion.address1 = lsc.address1;
            if(lsc.coordinates) $scope.champion.coordinates = lsc.coordinates;
            if(lsc.projects) $scope.champion.projects = lsc.projects;
            if(lsc.youthExperience) $scope.champion.youthExperience = lsc.youthExperience;
            if(lsc.twitter) $scope.champion.twitter = lsc.twitter;
            if(lsc.linkedIn) $scope.champion.linkedIn = lsc.linkedIn;
            if(lsc.notes) $scope.champion.notes = lsc.notes;
            if(lsc.coderDojoReference) $scope.champion.coderDojoReference = lsc.coderDojoReference;
            if(lsc.coderDojoReferenceOther) $scope.champion.coderDojoReferenceOther = lsc.coderDojoReferenceOther;
          }
        });
      }
    }, function () {
      currentUser = null;
      failAuth();
    });

    if(subStep && subStep === 'charter'){
      $scope.showCharterAgreement();
    } else {
      $scope.showCharterAgreementFlag = true;

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
          if(step2UpdateFlag) {
            if(savedDojoLead && savedDojoLead.application) {
              savedDojoLead.application.championDetails = champion;
              savedDojoLead.currentStep = 2;
              cdDojoService.saveDojoLead(savedDojoLead, function(response) {
                deleteLocalStorage('championDetails');
                setupStep3();
              }, failSave);
            } else {
              alertService.showError($translate.instant('Error updating champion details.'));
            }
          } else {
            cdDojoService.saveDojoLead(dojoLead, function (response) {
              deleteLocalStorage('championDetails');
              $scope.showCharterAgreement();
              intercomService.InitIntercom();
            },failSave);
          }
        };

        openConfirmation(win);
      };

      cdDojoService.listCountries(function (countries) {
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

    $scope.clearPlace = function(champion) {
      console.log($scope);
      champion.placeName = "";
      champion.placeGeonameId = "";
      champion.county = {};
      champion.state = {};
      champion.city = {};
      for (var adminidx=1; adminidx<=4; adminidx++) {
        champion['admin'+ adminidx + 'Code'] = "";
        champion['admin'+ adminidx + 'Name'] = "";
      }
      $scope.champion.place = "";
    };

    $scope.referredBy = [
      $translate.instant('Search Engine'),
      $translate.instant('Other CoderDojo Volunteers'),
      $translate.instant('Other Coding Organisations'),
      $translate.instant('Development Community'),
      $translate.instant('Events'),
      $translate.instant('Word of Mouth'),
      $translate.instant('Family/Friends'),
      $translate.instant('Media (newspaper/radio)'),
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
    var savedDojoLead = {};
    if(!$scope.setupDojo) $scope.setupDojo = {};
    $scope.buttonText = $translate.instant("Save Dojo Setup");
    $scope.hideIndicators = false;
    currentStepInt = 2;
    auth.get_loggedin_user(function (user) {
      currentUser = user;
      if (currentUser) {
        cdDojoService.loadUserDojoLead(currentUser.id, function(response) {
          if(response.application) {
            savedDojoLead = response;
            if(response.application.setupYourDojo) {
              $scope.buttonText = $translate.instant("Update Dojo Setup");
              _.each(response.application.setupYourDojo, function(item, i) {
                $scope.setupDojo[i] = item;
              });
            }
            if($localStorage[user.id] && $localStorage[user.id].dojoLead && $localStorage[user.id].dojoLead.setupYourDojo) {
              alertService.showAlert($translate.instant('There are unsaved changes on this page'));
              var lssd = $localStorage[user.id].dojoLead.setupYourDojo;
              cdDojoService.loadSetupDojoSteps(function (steps) {
                _.each(steps, function (item, i) {
                  _.each(item.checkboxes, function (item, i) {
                    $scope.setupDojo[item.name] = (typeof lssd[item.name] === 'undefined') ? $scope.setupDojo[item.name] : lssd[item.name];
                    $scope.setupDojo[item.name + 'Text'] = (item.textField && lssd[item.name + 'Text']) ? lssd[item.name + 'Text'] : "";
                  });
                });
              }, fail);
            }
          }
        });
      }
    }, function () {
      currentUser = null;
      failAuth();
    });

    cdDojoService.loadSetupDojoSteps(function (steps) {
      $scope.steps = _.map(steps, function(step){
        step.title = $translate.instant(step.title);

        if(step.checkboxes){
          step.checkboxes = _.map(step.checkboxes, function(checkbox){
            if(checkbox.title) checkbox.title = $sce.trustAsHtml($translate.instant(checkbox.title));
            if(checkbox.placeholder) checkbox.placeholder = $translate.instant(checkbox.placeholder);
            if(checkbox.requiredMessage) checkbox.requiredMessage = $translate.instant(checkbox.requiredMessage);
            if(checkbox.infoText) checkbox.infoText = $sce.trustAsHtml($translate.instant(checkbox.infoText));

            return checkbox;
          });
        }

        return steps;
      });
      $scope.steps = steps;
    }, fail);

    $scope.submitSetupYourDojo = function (setupDojo) {

      var win = function () {
        if(savedDojoLead.application) {
          savedDojoLead.application.setupYourDojo = setupDojo;
          savedDojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
          cdDojoService.saveDojoLead(savedDojoLead, function(response) {
            deleteLocalStorage('setupYourDojo');
            setupStep4();
          }, failSave);
        } else {
          failSave();
        }
      };
      openConfirmation(win);
    };

    $scope.openAllSteps = function (context) {
      var formInvalid = context.setupYourDojoForm.$invalid;
      if(formInvalid) {
        $scope.steps.map(function(step){
          step.open = true;
        });
        angular.element('form[name=' + context.setupYourDojoForm.$name + '] .ng-invalid')[0].scrollIntoView();
      }
    };

    if(!wizardRedirect) {
      WizardHandler.wizard().goTo(2, true);
    }
    $scope.stepFinishedLoading = true;
  }
    //--

    $scope.updateLocalStorage = function (localObj, item, value) {
      if(currentUser) {
        if(!$localStorage[currentUser.id]) $localStorage[currentUser.id] = {};
        if(!$localStorage[currentUser.id].dojoLead) $localStorage[currentUser.id].dojoLead = {};
        if(!$localStorage[currentUser.id].dojoLead[localObj]) $localStorage[currentUser.id].dojoLead[localObj] = {};
        if(typeof value === 'undefined') value = false;
        $localStorage[currentUser.id].dojoLead[localObj][item] = value;
      }
    }

    var deleteLocalStorage = function (localObj) {
      if(currentUser) {
        if($localStorage[currentUser.id] && $localStorage[currentUser.id].dojoLead && $localStorage[currentUser.id].dojoLead[localObj]) {
          delete $localStorage[currentUser.id].dojoLead[localObj]
        }
      }
    }

  //--Step Four:
  function setupStep4(wizardRedirect) {
    $scope.hideIndicators = false;
    $scope.buttonText = $translate.instant("Create Dojo");

    $scope.stepFourShowGmap = true;

    currentStepInt = 3;

    auth.get_loggedin_user(function(user) {
      currentUser = user;
      $scope.user = user;
    }, function() {
      currentUser = null;
      failAuth();
    });

    $scope.dojo = {};
    $scope.dojo.stage = 0;

    $scope.createDojoUrl = $state.current.url;

    cdDojoService.listCountries(function(countries) {
      $scope.countries = countries;
    }, fail);

    $scope.setCountry = function(dojo, country) {
      dojo.countryName = country.countryName;
      dojo.countryNumber = country.countryNumber;
      dojo.continent = country.continent;
      dojo.alpha2 = country.alpha2;
      dojo.alpha3 = country.alpha3;
    };

    var initContent = "<p>" +
      $translate.instant('Suggested Notes:') + "<br><br>" + $translate.instant('Please bring:') +
      "<ul><li>" + $translate.instant('A pack lunch.') +"</li>" +
      "<li>"+ $translate.instant('A laptop. Borrow one from somebody if needs be.') +"</li>" +
      "<li><b>" + $translate.instant('A parent! (Very important). If you are 12 or under, your parent must stay with you during the session.') +"</b></li>" +
      "</ul></p>";

    $scope.editorOptions = {
      language: 'en',
      uiColor: '#000000',
      height:'200px',
      initContent:initContent
    };

    $scope.setPlace = function(dojo, place, form) {
      if(place.nameWithHierarchy.length > 40) {
        if(form) form.place.$setValidity("maxLength", false);
      } else {
        if(form) form.place.$setValidity("maxLength", true);
      }
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

    $scope.clearPlace = function(dojo) {
      dojo.placeName = "";
      dojo.placeGeonameId = "";
      dojo.county = {};
      dojo.state = {};
      dojo.city = {};
      for (var adminidx=1; adminidx<=4; adminidx++) {
        dojo['admin'+ adminidx + 'Code'] = "";
        dojo['admin'+ adminidx + 'Name'] = "";
      }
      $scope.dojo.place = "";
    };

    if($localStorage[currentUser.id] && $localStorage[currentUser.id].dojoLead && $localStorage[currentUser.id].dojoLead.dojoListing) {
      alertService.showAlert($translate.instant('There are unsaved changes on this page'));
      var lsdl = $localStorage[currentUser.id].dojoLead.dojoListing;

      if(lsdl.name) $scope.dojo.name = lsdl.name;
      if(lsdl.email) $scope.dojo.email = lsdl.email;
      if(lsdl.time) $scope.dojo.time = lsdl.time;
      if(lsdl.country) {
        $scope.dojo.country = lsdl.country;
        $scope.setCountry($scope.dojo, lsdl.country);
      }
      if(lsdl.place) {
        $scope.dojo.place = lsdl.place;
        $scope.setPlace($scope.dojo, lsdl.place);
      }
      if(lsdl.country && lsdl.place) {
        $scope.getLocationFromAddress($scope.dojo);
      }
      if(lsdl.address1) $scope.dojo.address1 = lsdl.address1;
      if(lsdl.coordinates) $scope.dojo.coordinates = lsdl.coordinates;
      if(lsdl.needMentors) $scope.dojo.needMentors = lsdl.needMentors;
      if(lsdl.stage) $scope.dojo.stage = lsdl.stage;
      if(lsdl.private) $scope.dojo.private = lsdl.private;
      if(lsdl.googleGroup) $scope.dojo.googleGroup = lsdl.googleGroup;
      if(lsdl.website) $scope.dojo.website = lsdl.website;
      if(lsdl.twitter) $scope.dojo.twitter = lsdl.twitter;
      if(lsdl.supporterImage) $scope.dojo.supporterImage = lsdl.supporterImage;
      if(lsdl.mailingList) $scope.dojo.mailingList = lsdl.mailingList;
    }

    $scope.save = function(dojo) {
      $scope.getLocationFromAddress($scope.dojo, function(){

        var win = function(){

          cdDojoService.loadUserDojoLead(currentUser.id, function(response) {
            var dojoLead = response;
            dojoLead.application.dojoListing = dojo;
            dojoLead.currentStep = stepNames.indexOf($scope.wizardCurrentStep) + 1;
            cdDojoService.saveDojoLead(dojoLead, function (response) {
              dojo.dojoLeadId = response.id;
              dojo.emailSubject = $translate.instant('A Google email account has been created for your Dojo');
              cdDojoService.save(dojo, function (response) {
                deleteLocalStorage('dojoListing');

                //update intercom champion dojos
                intercomService.updateIntercom(response.dojo_id);

                $state.go('dojo-list', {
                  bannerType:'success',
                  bannerMessage: $translate.instant('Thank you for submitting your dojo listing. A member from the CoderDojo Foundation team will review your listing and be in touch shortly.'),
                  bannerTimeCollapse: 150000
                });
              });
            },failSave);
          }, fail);
        };

        openConfirmation(win);
      });
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

    $scope.getLocationFromAddress = function(obj, cb) {
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
        if(cb) cb();
      }, function (err) {
        //Ask user to add location manually if google geocoding can't find location.
        alertService.showError($translate.instant('Please add your location manually by clicking on the map.'));
        if(cb) cb();
      });
    }

  }
  var openConfirmation = function (win, fail) {

    var modalInstance = $modal.open({
        animation: true,
        templateUrl: '/dojos/template/dojo-setup-confirm',
        controller: 'dojoSetupConfirmationCtrl'
      });

    modalInstance.result.then(win, fail);
  };

}

angular.module('cpZenPlatform')
  .controller('start-dojo-wizard-controller', ['$scope', '$window', '$state', '$location', 'auth', 'alertService', 'WizardHandler', 'cdDojoService',
    'cdAgreementsService', 'gmap', '$translate', 'utilsService', 'intercomService', '$modal',
    '$localStorage','$sce', startDojoWizardCtrl]);
