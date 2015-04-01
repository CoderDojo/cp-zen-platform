'use strict'; 
  function cdDojoService(cdApi){
    function topfail(err){
      console.log(err);
    }
    var editDojo = {};
    return {
      list: function(win, fail){
        cdApi.get('dojos', win, fail || topfail);
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
      addDojoToEdit: function(dojo, win, fail) {
        editDojo = dojo;
        if(editDojo) return win(editDojo); 
        var err = new Error('Edit Dojo Failed');
        fail(err);
      },
      getDojoToEdit: function(win, fail) {
        if(! _.isEmpty(editDojo)) return win(editDojo);
        var err = new Error('Edit Dojo Failed');
        if(fail) return fail(err);
      }
    }
  }
angular.module('cpZenPlatform')
  .service('cdDojoService', ['cdApi', cdDojoService])
;
