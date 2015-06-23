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

  utils.contains = _.contains;

  utils.hasAccess = function(userTypes, allowedTypes){
    var returnType = _.find(allowedTypes, function(allowedType){
      return _.contains(userTypes, allowedType);
    });

    return (typeof returnType === 'undefined') ? false : true;
  };

  return utils;
});
