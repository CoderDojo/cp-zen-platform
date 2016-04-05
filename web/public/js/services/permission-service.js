'use strict';

function permissionService () {

  var service = {};

  /*hierarchical declaration of usertypes and permissions
  order matters, the lesser index, the higher responsabilities*/
  var _userTypes = [
    'founder',
    'champion',
    'mentor',
    'parent-guardian',
    'attendee-o13',
    'attendee-u13',
    '' //as of guest user, non-authenticated, or without any role, which shouldn't exists
  ];

  var _permissions = [
    'cdf-admin',
    'dojo-admin',
    'ticketing-admin'
  ];

  //TODO : an engine of capabilities
  //ex: can(action, usertype, args)

  /** @function: return the main permission to be applied
  * @param: array the usertypes of the user to be checked
  */
  service.getUserType = function (userTypes) {
    return _userTypes[_.min(_.map(userTypes, function(userType){
      var exists = _userTypes.indexOf(userType);
      if(exists > -1){
        return exists;
      }
    }))];
  };

  /**
  * @function: create an array of role which are lesser important than the one inputed
  * @param: userType the base usertype to compare with
  */
  service.getAllowedUserTypes = function (userType, exclusive){
    var userTypePrio = _userTypes.indexOf(userType);
    return _.filter(_userTypes, function( priority, index ){
      if(exclusive){
        return userTypePrio < index;
      }
      return  userTypePrio <= index;
    });
  };

  return service;
}

angular.module('cpZenPlatform')
.factory('permissionService', [permissionService]);
