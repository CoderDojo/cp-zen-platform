'use strict';

angular.module('cpZenPlatform').factory('utilsService', ['cdCountriesService', '$q', function(cdCountriesService, $q) {
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

  utils.validatePassword = function(password, email) {
    if(password) {
      var numbers = /[0-9]/;
      var characters = /[!|@|#|$|%|^|&|*|(|)|-|_]/;

      var numberCount = numbers.test(password);
      var characterCount = characters.test(password);
      var minPasswordLength = 8;
      var characterGroupCount = numberCount + characterCount;

      var matchesEmail = (function() { 
        if(password === email) { 
          return true; 
        } else { 
          return false; 
        }
      }());
      
      if ((password.length >= minPasswordLength) && (characterGroupCount >= 1) && !matchesEmail) {
        //Password valid
        return {valid: true};
      } else if(matchesEmail) {
        //Password matches email address
        return {valid: false, msg: 'Password must not be the same as your email address'};
      } else {
        //Password invalid
        return {valid: false, msg: 'Password must be a minimum of 8 characters in length and contain at least one number or punctuation character'};
      }
    }
    return {valid: true};
  }

  utils.capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  utils.keyForValue = function (obj, value) {
    for( var prop in obj ) {
      if( obj.hasOwnProperty( prop ) ) {
        if( obj[ prop ] === value )
          return prop;
      }
    }
  }

  utils.getHighestUserType = function (userTypes) {
    var userTypesByPermissionLevel = {
      'champion': 1,
      'mentor': 2,
      'parent-guardian': 3,
      'attendee-o13': 4,
      'attendee-u13': 5
    };

    var userTypeNumbers = _.map(userTypes, function (userType) {
      return userTypesByPermissionLevel[userType];
    });
    
    var sortedUserTypeNumbers = _.sortBy(userTypeNumbers);
    return utils.keyForValue(userTypesByPermissionLevel, sortedUserTypeNumbers[0]);
  }

  utils.getPlaces = function (countryCode, $select) {
    var deferred = $q.defer();
    var search = $select.search;
    var places = [];
    
    if (!countryCode || !search.length || search.length < 3) {
      deferred.resolve(places);
    } else {
      var query = {
        query: {
          filtered: {
            query: {
              multi_match: {
                query: search,
                type: "phrase_prefix",
                fields: ['name', 'asciiname', 'alternatenames', 'admin1Name', 'admin2Name', 'admin3Name', 'admin4Name']
              }
            },
            filter: {
              bool: {
                must: [
                  {
                    term: {
                      countryCode: countryCode
                    }
                  },
                  {
                    term: {
                      featureClass: "P"
                    }
                  }
                ]
              }
            }
          }
        },
        from: 0,
        size: 100,
        sort: [
          { asciiname: "asc" }
        ]
      };

      cdCountriesService.listPlaces(query, function (result) {
        places = _.map(result, function(place) {
          return _.omit(place, 'entity$');
        });
        if(_.isEmpty(places)) {
          if($select.search && !$select.clickTriggeredSelect) {
            places.push({nameWithHierarchy: $select.search});
          }
        }
        deferred.resolve(places);
      }, function (err) {
        deferred.reject(err);
      });
    }
    return deferred.promise;
  }

  return utils;
}]);
