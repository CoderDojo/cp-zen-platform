'use strict';

angular.module('cpZenPlatform').factory('utilsService', ['cdDojoService', '$q', 'Geocoder', function(cdDojoService, $q, Geocoder) {
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

    if (!countryCode || !search.length || search.length < 3) {
      deferred.resolve([]);
    } else {
      var query = {
        countryCode: countryCode,
        search: search
      };

      cdDojoService.listPlaces(query, function (places) {
        if(_.isEmpty(places) && $select.search && !$select.clickTriggeredSelect) {
          places.push($select.search);
        }
        deferred.resolve(_.map(places, function (name) {
          return { nameWithHierarchy: name };
        }));
      }, function (err) {
        deferred.reject(err);
      });
    }

    return deferred.promise;
  }

  utils.getLocationFromAddress = function(obj) {
    var deferred = $q.defer();
    if(obj && obj.place) {
      if(!obj.placeName) obj.placeName = obj.place.name || obj.place.toponymName || obj.place.nameWithHierarchy;
      var address = obj.placeName;
      for (var adminidx=4; adminidx >= 1; adminidx--) {
        if (obj['admin'+adminidx+'Name']) {
          address = address + ', ' + obj['admin'+adminidx+'Name'];
        }
      }
      var addr1 = (typeof obj.address1 !== 'undefined') ? obj.address1 + ', ' : "";
      address = address + ', ' + obj.countryName;
      Geocoder.latLngForAddress(addr1 + address).then(function (data) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject('Error geocoding');
      });
    } else {
      deferred.reject('No data to geocode');
    }
    return deferred.promise;
  }

  utils.getSortClass = function (sort) {
    if(sort < 0) {
      return 'pointer sortable glyphicon glyphicon-chevron-up';
    } else {
      return 'pointer sortable glyphicon glyphicon-chevron-down';
    }
  }

  utils.filterFloat = function (value) {
    if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
        .test(value))
      return Number(value);
    return NaN;
  };

  utils.toTitleCase = function(str) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })
  }

  return utils;
}]);
