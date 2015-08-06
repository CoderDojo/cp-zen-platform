'use strict';

function cdReviewChampionApplicationCtrl($scope, $state, cdDojoService, $translate) {
  var applicationId = $state.params.id;

  cdDojoService.loadDojoLead(applicationId, function(response) {
  	var championApplication = response.application.championDetails;

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
  });
}

angular.module('cpZenPlatform')
    .controller('review-champion-application-controller', ['$scope', '$state', 'cdDojoService', '$translate', cdReviewChampionApplicationCtrl]);
