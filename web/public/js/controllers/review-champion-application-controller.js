'use strict';

function cdReviewChampionApplicationCtrl($scope, $state, cdDojoService, $translate) {
  var applicationId = $state.params.id;

  cdDojoService.loadDojoLead(applicationId, function(response) {
  	var championApplication = response.application.championDetails;

  	var championDOB = moment(championApplication.dateOfBirth).format('MM/DD/YYYY');
  	championApplication.dateOfBirth = championDOB;

  	var yesNoVal = championApplication.hasTechnicalMentorsAccess;
    yesNoVal = yesNoVal ? $translate.instant('Yes') : $translate.instant('No');
  	championApplication.hasTechnicalMentorsAccess = yesNoVal;

  	yesNoVal = championApplication.hasVenueAccess;
    yesNoVal = yesNoVal ? $translate.instant('Yes') : $translate.instant('No');
  	championApplication.hasVenueAccess = yesNoVal;

  	$scope.championApplication = championApplication;

  });
}

angular.module('cpZenPlatform')
    .controller('review-champion-application-controller', ['$scope', '$state', 'cdDojoService', '$translate', cdReviewChampionApplicationCtrl]);
