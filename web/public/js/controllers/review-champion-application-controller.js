(function() {
  'use strict';

  function cdReviewChampionApplicationCtrl($scope, $state, cdDojoService) {
    var applicationId = $state.params.id;
    $scope.dojoLead;

    cdDojoService.loadDojoLead(applicationId, function(response) {
      var championApplication = response.application.championDetails;

      var championDOB = moment(championApplication.dateOfBirth).format('MM/DD/YYYY');
      championApplication.dateOfBirth = championDOB;

      var yesNoVal = championApplication.hasTechnicalMentorsAccess;
      yesNoVal ? yesNoVal = 'Yes' : yesNoVal = 'No';
      championApplication.hasTechnicalMentorsAccess = yesNoVal;

      yesNoVal = championApplication.hasVenueAccess;
      yesNoVal ? yesNoVal = 'Yes' : yesNoVal = 'No';
      championApplication.hasVenueAccess = yesNoVal;

      $scope.championApplication = championApplication;

    });
  }

  angular.module('cpZenPlatform')
    .controller('review-champion-application-controller', ['$scope', '$state', 'cdDojoService', cdReviewChampionApplicationCtrl]);
})();

