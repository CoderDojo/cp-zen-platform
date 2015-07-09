 'use strict';

function cdAcceptBadgeCtrl($scope) {
	console.log("accept badge controller called");
}

angular.module('cpZenPlatform')
    .controller('accept-badge-controller', ['$scope', cdAcceptBadgeCtrl]);