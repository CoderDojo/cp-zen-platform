'use strict'; 
  function cdDojoService(cdApi){
    function topfail(err){
      console.log(err);
    }
    var currentDojo = {};
    return {
      list: function(win, fail){
        cdApi.get('dojos', win, fail || topfail);
      },
      load: function(id, win, fail) {
        cdApi.get('dojos/' + id, win, fail || topfail);
      },
      count: function(currentUser, win, fail){
        cdApi.post('dojos/my_dojos_count', {user: currentUser}, win, fail || topfail);
      },
      search: function (query, currentUser, win, fail) {
        cdApi.post('dojos/my_dojos_search', {query: query, user:currentUser}, win, fail || topfail);
      },
      save: function(dojo, win, fail) {
        if (dojo.id) {
          cdApi.put('dojos/' + dojo.id, { dojo: dojo }, win, fail);
        }
        else {
          cdApi.post('dojos', { dojo: dojo }, win, fail || topfail);
        } 
      },
      setDojo: function(dojo, win, fail) {
        currentDojo = dojo;
        if(currentDojo) return win(currentDojo); 
        var err = new Error('Set Dojo Failed');
        fail(err);
      },
      getDojo: function() {
        return currentDojo;
      },
      delete: function(id, win, fail) {
        cdApi.delete('dojos/' + id, win, fail);
      }
    }
  }
angular.module('cpZenPlatform')
  .service('cdDojoService', ['cdApi', cdDojoService])
;
