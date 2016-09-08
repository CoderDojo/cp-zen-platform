;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

var cdfPollResults = {
  restrict: 'E',
  bindings: {
    results: '=',
    formattedCount: '<'
  },
  templateUrl: '/directives/tpl/cdf/polls/results',
  controller: ['cdPollService', '$q', 'cdDojoService', '$stateParams',
  function (cdPollService, $q, cdDojoService, $stateParams) {
    var cdfPR = this;
    cdfPR.filter = {};
    cdfPR.filter.dojoName = '';
    cdfPR.rawDojoList = [];
    cdfPR.dojoList = {};
    cdfPR.newResult = {};
    cdfPR.$onInit = function () {
      cdfPR.initResults();
    }

    cdfPR.getResults = function () {
     return cdPollService.getResults({pollId: cdfPR.pollId})
     .then(function(response){
       cdfPR.results = response.data;
     });
    }

    cdfPR.getDojoList = function ( ) {
      return cdDojoService.list({fields$: ['id','name', 'email']})
      .then(function (response) {
        // Array format to allow usage of default ng filters (doesn't work well w/ objects)
        cdfPR.rawDojoList = response.data;
        _.each(response.data, function (dojo) {
          cdfPR.dojoList[dojo.id] = dojo;
        });
      });
    }

    cdfPR.assignDojoList = function () {
     _.each(cdfPR.results, function(result, index){
       cdfPR.results[index].dojoName = cdfPR.dojoList[result.dojoId].name;
     })
    }

    cdfPR.initResults = function(){
      if (!cdfPR.results || cdfPR.results.length === 0) {
       cdfPR.pollId = $stateParams.pollId;
       return cdfPR.getResults()
       .then(cdfPR.getDojoList)
       .then(cdfPR.assignDojoList);
      } else {
       return cdfPR.getDojoList()
       .then(cdfPR.assignDojoList);
      }
    }

    cdfPR.create = function(newResult){
      var result = {
        dojoId: newResult.dojo.id,
        value: newResult.id
      };
      cdfPR.save(result)
      .then(function(response){
        cdfPR.results.push(response.data);
        cdfPR.newResult = {};
      })
    }

    cdfPR.save = function (result) {
      var toBeSaved = _.clone(result);
      delete toBeSaved.entity$;
      delete toBeSaved.createdAt;
      return cdPollService.save(toBeSaved)
      .then(function (response) {
        result = response.data;
      });
    }
    cdfPR.remove = function (result, index) {
      cdPollService.remove(result.id)
      .then(function (response) {
        cdfPR.results.splice(index, 1);
      });
    }
  }],
  controllerAs: 'cdfPR'
};

angular
    .module('cpZenPlatform')
    .component('cdfPollResults', cdfPollResults);
}());
