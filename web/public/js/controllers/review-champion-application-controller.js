'use strict';

function cdReviewChampionApplicationCtrl($scope, $state, cdDojoService) {
  var applicationId = $state.params.id;  
  $scope.dojoLead;

  cdDojoService.loadDojoLead(applicationId, function(response) {
  	var championDOB = moment(response.application.championDetails.dateOfBirth).format('MM/DD/YYYY');
  	response.application.championDetails.dateOfBirth = championDOB;

  	var yesNoVal = response.application.championDetails.hasTechnicalMentorsAccess;
  	yesNoVal ? yesNoVal = 'Yes' : yesNoVal = 'No';
  	response.application.championDetails.hasTechnicalMentorsAccess = yesNoVal;

  	yesNoVal = response.application.championDetails.hasVenueAccess;
  	yesNoVal ? yesNoVal = 'Yes' : yesNoVal = 'No';
  	response.application.championDetails.hasVenueAccess = yesNoVal;
  	
  	$scope.dojoLead = response.application;

  });
}

angular.module('cpZenPlatform')
    .controller('review-champion-application-controller', ['$scope', '$state', 'cdDojoService', cdReviewChampionApplicationCtrl]);