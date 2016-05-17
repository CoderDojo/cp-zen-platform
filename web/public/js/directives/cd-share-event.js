;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

function cdShareEvent($stateParams, cdDojoService, $state, $translate, $location) {
    return {
      restrict: 'E',
      scope: {
        shareEvent : '='
      },
      template:
      '<span>{{ share }}</span>'+
      '<ul class="list-unstyled list-inline">'+
        '<li>'+
          '<button socialshare="" socialshare-provider="facebook" '+
          'class="btn btn-medium center-content color-black '+
          'radius3 bg-white" '+
          'socialshare-text="{{ event.name }}" '+
          'socialshare-url="{{ event.url }}">'+
            '<i class="fa fa-facebook"></i> Facebook'+
          '</button>'+
        '</li>'+
        '<li>'+
          '<button socialshare="" socialshare-provider="twitter" '+
          'class="btn btn-medium center-content color-black '+
          'radius3 bg-white" '+
          'socialshare-text="{{ event.name }}" '+
          'socialshare-hashtags="coderdojo" '+
          'socialshare-url="{{ event.url }}">'+
            '<i class="fa fa-twitter"></i> Twitter'+
          '</button>'+
        '</li>'+
        '<li>'+
          '<a ng-click="show = !show">Embed me!</a>'+
          '<input type="text" read-only="read-only" ng-show="show" ng-model="iframe"/> '+
          '</input>'+
        '</li>'+
      '</ul>',
      controller: function($scope){
        $scope.event = $scope.shareEvent;
        $scope.event.url = $location.protocol() + '://' + $location.host() +
          $state.href('event', {dojoId: $scope.event.dojoId, eventId: $scope.event.id});
        $scope.event.embeddedUrl = $location.protocol() + '://' + $location.host() +
          $state.href('embedded.event', {dojoId: $scope.event.dojoId, eventId: $scope.event.id});
        $scope.share = $translate.instant('Invite your friends!');
        $scope.show = false;
        $scope.iframe = '<iframe src="'+ $scope.event.embeddedUrl +'" width="500px" height="600px"></iframe>';
      }
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdShareEvent', ['$stateParams', 'cdDojoService', '$state', '$translate', '$location',
     cdShareEvent]);

}());
