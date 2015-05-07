 'use strict';

function cdReviewChampionApplicationCtrl($scope, $state) {
  var applicationId = $state.params.id;  
  
}

angular.module('cpZenPlatform')
    .controller('review-champion-application-controller', ['$scope', '$state', cdReviewChampionApplicationCtrl]);