;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

function cdPollMap($compile, $interval, cdPollService, cdDojoService, cdTheme, $timeout){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/poll/map',
      transclude: true,
      controller: function($scope){
        $scope.markers = [];
        $scope.model = {};
        var colors = _.values(cdTheme.colors);
        if ($scope.gmap) {
          $scope.mapLoaded = true;
          $scope.mapOptions = {
            center: new google.maps.LatLng(25, -5),
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          var interval = 30000;
          var getLastResults = function (time) {
            var query = {pollId: $scope.pollId};
            if (time) {
              query.createdAt = time;
            }
            cdPollService.getResults(query,
              function (results) {
                var votes = {};
                if (results.length > 0) {
                  cdDojoService.list({ids: _.map(results, 'dojoId')}, function(dojos) {
                    async.eachSeries(dojos, function (dojo, done) {
                      votes[dojo.id] = _.find(results, {dojoId: dojo.id});
                      votes[dojo.id].dojo = dojo;
                      if (dojo.geoPoint && _.isFinite(parseInt(votes[dojo.id].value))) {
                        //  Magic trick to display an active-alike map
                        $timeout(function () {
                          var valueLength = votes[dojo.id].value.toString().length;
                          var color = colors[Math.floor(Math.random() * (colors.length))];
                          var marker = new StyledMarker({
                            map: $scope.model.map,
                            position: new google.maps.LatLng(dojo.geoPoint.lat, dojo.geoPoint.lon),
                            animation: google.maps.Animation.DROP,
                            styleIcon: new StyledIcon(StyledIconTypes.BUBBLE,
                              {color: color, text: votes[dojo.id].value.toString()})
                            });
                            done();
                            $scope.markers.push(marker);
                          }, 1000/results.length);
                      } else {
                        done();
                      }
                    });
                });
              }
            });
          };
          getLastResults();
          $interval(function(){
            getLastResults({gte$: moment().subtract(interval, 'ms')});
          }, interval);
        }
      },
      link: function (scope, element, attrs) {

      },
      replace: true
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdPollMap', ['$compile', '$interval', 'cdPollService', 'cdDojoService', 'cdTheme', '$timeout', cdPollMap]);

}());
