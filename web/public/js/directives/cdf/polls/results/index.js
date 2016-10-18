;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

var cdfPollResults = {
  restrict: 'E',
  bindings: {
    poll: '<',
    results: '=',
    formattedCount: '<'
  },
  templateUrl: '/directives/tpl/cdf/polls/results',
  controller: ['cdPollService', '$q', 'cdDojoService', '$stateParams', 'atomicNotifyService', '$translate',
  function (cdPollService, $q, cdDojoService, $stateParams, atomicNotifyService, $translate) {
    var cdfPR = this;
    cdfPR.filter = {};
    cdfPR.filter.dojoName = '';
    cdfPR.rawDojoList = [];
    cdfPR.dojoList = {};
    cdfPR.newResult = {};
    cdfPR.providers = [{
      name: 'sendGrid',
      type: 'email',
      // Require auth, alas :)
      // https://api.sendgrid.com/v3/download/categories/stats?start_date=2016-08-21&end_date=2016-09-20&categories=polls-notification-en_US&aggregated_by=day
      url: 'https://app.sendgrid.com/statistics/category'
    },
    {
      name: 'Twilio',
      type: 'sms',
      url: 'https://www.twilio.com/console/sms/logs'
    }];
    cdfPR.$onInit = function () {
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
      delete toBeSaved.dojoName;
      return cdPollService.save(toBeSaved)
      .then(function (response) {
        result = response.data;
        atomicNotifyService.info($translate.instant('The poll result has been saved successfuly'));
      })
      .catch(function (err) {
        atomicNotifyService.info($translate.instant('Something went wrong when saving the poll result') + err);
      });
    }

    cdfPR.remove = function (result, index) {
      cdPollService.remove(result.id)
      .then(function (response) {
        cdfPR.results.splice(index, 1);
      });
    }

    cdfPR.sendEmail = function (result) {
      cdPollService.sendEmail(result.dojoId, cdfPR.poll.id)
      .then( function () {
        atomicNotifyService.info($translate.instant('Your email has been sent successfuly'));
      })
      .catch( function (err) {
        atomicNotifyService.info($translate.instant('Something went wrong when sending the email :') + err);
      });
    }
  }],
  controllerAs: 'cdfPR'
};

angular
    .module('cpZenPlatform')
    .component('cdfPollResults', cdfPollResults);
}());
