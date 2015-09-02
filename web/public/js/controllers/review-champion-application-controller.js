'use strict';

function cdReviewChampionApplicationCtrl($scope, $state, cdDojoService, $translate, utilsService) {
  var applicationId = $state.params.id;
  var toTitleCase = utilsService.toTitleCase;

  cdDojoService.loadDojoLead(applicationId, function(response) {
  	var championApplication = response.application.championDetails;
    var setupYourDojo = response.application.setupYourDojo;
  	var championDOB = moment(championApplication.dateOfBirth).format('MM/DD/YYYY');
  	championApplication.dateOfBirth = championDOB;

    championApplication.prerequisites = [];
    cdDojoService.loadSetupDojoSteps(function (steps) {
      _.each(steps, function(item, i) {
        _.each(item.checkboxes, function(item, i) {
          if(item.required === true) {
            var obj = {}
            obj.name = item.name;
            obj.text = item.title;
            obj.value = (response.application.setupYourDojo[item.name]) ? 'Yes' : 'No' ;
            championApplication.prerequisites.push(obj);
          }
        })
      });
    });
  	$scope.championApplication = championApplication;

    $scope.setupDojoSteps = [];
    _.each(_.keys(setupYourDojo), function (setupDojoKey) {
      var setupStep = {
        key: setupDojoKey
      };
      if(setupDojoKey.slice(-4) !== 'Text') {
        setupStep.title = toTitleCase(setupDojoKey);
        setupStep.value = (setupYourDojo[setupDojoKey]) ? 'Yes' : 'No';
        if(setupYourDojo.hasOwnProperty(setupDojoKey + 'Text')) {
          setupStep.textArea = true;
          setupStep.text = setupYourDojo[setupDojoKey + 'Text'];
        }
        $scope.setupDojoSteps.push(setupStep);
      }
    });
  });

}

angular.module('cpZenPlatform')
    .controller('review-champion-application-controller', ['$scope', '$state', 'cdDojoService', '$translate', 'utilsService', cdReviewChampionApplicationCtrl]);
