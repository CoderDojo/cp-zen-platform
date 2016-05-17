'use strict';
/* global bootbox */

angular.module('cpZenPlatform').factory('embedder', ['$rootScope', '$state', '$window', function($rootScope, $state, $window) {
  var embedder = {};

  //Rebuild a state without its embedding parent
  embedder.disEmbed = function ( ) {
    var state = $state.current;
    state = state.name.replace('embedded.', '');
    $state.get(state);
    return $state.href(state, $state.params);
  };

  embedder.isEmbedded = function ( state ) {
    var currentState = state || $state.current ;
    var returned = false;
    if( currentState.parent === 'embedded' ) {
      returned = true;
    }
    return returned;
  };

  embedder.redirectWrapper = function (callback){
    if ( embedder.isEmbedded() ){
      window.open(embedder.disEmbed(), '_blank');
    }
    if(callback){
      callback();
    }
  };

  return embedder;
}]);
