'use strict';

angular.module('cpZenPlatform').factory('utilsService', function() {
  var utils = {};

  utils.toTags = function(values){
    var tags = _.map(values, function(value){
      return {text: value};
    });

    return tags;
  };

  utils.frTags = function(tags){
    return _.pluck(tags, 'text');
  };

  return utils;
});
