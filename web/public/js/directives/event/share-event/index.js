;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

function cdShareEvent($stateParams, cdDojoService, $state, $translate, $location, $timeout) {
    return {
      restrict: 'E',
      scope: {
        shareEvent : '=',
        mobile : '='
      },
      template:
      '<span class="cd-share-event__share-btn" ng-click="setMenuVisibility($event)" tabindex="-1" ><i class="fa fa-share" title="{{ share }}"></i></span>'+
      '<ul class="list-unstyled cd-share-event__share-list" ng-show="visible">'+
        '<li>'+
          '<button socialshare="" socialshare-provider="facebook" '+
          'class="btn btn-medium'+
          'radius3 bg-white" '+
          'socialshare-text="{{ event.name }}" '+
          'socialshare-url="{{ event.url }}">'+
            '<i class="fa fa-facebook"></i> Facebook'+
          '</button>'+
        '</li>'+
        '<li>'+
          '<button socialshare="" socialshare-provider="twitter" '+
          'class="btn btn-medium'+
          'radius3 bg-white" '+
          'socialshare-text="{{ event.name }}" '+
          'socialshare-hashtags="coderdojo" '+
          'socialshare-url="{{ event.url }}">'+
            '<i class="fa fa-twitter"></i> Twitter'+
          '</button>'+
        '</li>'+
        '<li>'+
          '<button class="btn btn-medium" ng-mousedown="setSubItemVisibility($event, \'show\')">Embed me!</button>'+
          '<textarea type="text" read-only="read-only" ng-show="show"  class="form-control" ng-model="iframe"/> '+
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

        $scope.visible = false;
        $scope.show = false;
        $scope.watchers = {};
        $scope.justOpened = false;

        $scope.setMenuVisibility = function ($event) {
          $scope.setVisibilityWatcher($event, 'visible', hideMenu);
          function hideMenu (event, field) {
            // We opened a subitem : 0 = one to be opened, 1 = 2 to be opened, 2 = menu and submenu opened
            // Doesn't support multiple subitems without closing another one before
            if (_.includes(_.keys($scope.watchers), 'show') && $scope.justOpened)  {
              $scope.justOpened = false;
              return;
            }
            return hideItem(event, field);
          }
        }

        $scope.setSubItemVisibility = function ($event) {
          $scope.setVisibilityWatcher($event, 'show');
          $scope.justOpened = true;
        }

        $scope.setVisibilityWatcher = function ($event, field, callback){
          $scope[field] = !$scope[field];
          var event = $event;
          if ($scope[field]){
            $scope.watchers[field] = $event.currentTarget;
            $(event.currentTarget).on('focusout', function(){
              if (_.isFunction(callback)) return callback(event, field);
              return hideItem(event, field);
            });
          }
        }

        function hideItem (event, field) {
          var watcher = $scope.watchers[field];
          $(watcher).off('focusout');
          delete $scope.watchers[field];
          $timeout(function(){
            $scope[field] = false;
          });
        }

        $scope.iframe = '<iframe src="'+ $scope.event.embeddedUrl +'" width="500px" height="600px"></iframe>';
      }
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdShareEvent', ['$stateParams', 'cdDojoService', '$state', '$translate', '$location', '$timeout',
     cdShareEvent]);

}());
