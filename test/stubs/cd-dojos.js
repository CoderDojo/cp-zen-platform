'use strict';

module.exports = function (options) {
  return {

    loadDojoLead : function(id, done) {
      done({
        application:{
          championDetails: {
            dateOfBirth: '01/01/2015',
            hasTechnicalMentorsAccess: true,
            hasVenueAccess: false
          }
        }
      });
    }
  }
}