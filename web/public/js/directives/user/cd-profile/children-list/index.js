

;(function() {
  'use strict';

  function listOfChildren(){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/user/cd-profile/children-list',
      controller: ['$scope', '$state', function($scope, $state) {
        var watcher = $scope.$watch('profile.resolvedChildren', function(newChildren){
          if(!_.isEmpty(newChildren)){
            _.each($scope.profile.resolvedChildren, function(user, index){
              $scope.profile.resolvedChildren[index].href = $state.href('user-profile', {userId: user.userId});
              $scope.profile.resolvedChildren[index].picture = '/api/2.0/profiles/' + user.id + '/avatar_img';
              $scope.profile.resolvedChildren[index].caption = user.name;
            });
          }
        });
        $scope.$on('$destroy', function(){
          watcher();
        });
      }]
    };
  }

  angular
    .module('cpZenPlatform')
    .directive('childrenList', listOfChildren);
}());
